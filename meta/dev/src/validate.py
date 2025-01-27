import re
import sys
from pathlib import Path
from typing import Any, cast

import simplejson as json
import yaml

KEYSEPARATOR = "/"

_collection_regex = r"[a-z](?:[a-z_]+[a-z]+)?"
_field_regex = r"[a-z][a-z0-9_]*"

COLLECTION_REGEX = re.compile(f"^{_collection_regex}$")
FIELD_REGEX = re.compile(f"^{_field_regex}$")
COLLECTIONFIELD_REGEX = re.compile(f"^{_collection_regex}{KEYSEPARATOR}{_field_regex}$")

DECIMAL_REGEX = re.compile(r"^-?(\d|[1-9]\d+)\.\d{6}$")
COLOR_REGEX = re.compile(r"^#[0-9a-f]{6}$")

DEFAULT_FILES = [str((Path(__file__).parent / ".." / ".." / "models.yml").resolve())]

RELATION_TYPES = (
    "relation",
    "relation-list",
    "generic-relation",
    "generic-relation-list",
)

DATA_TYPES = (
    "string",
    "number",
    "string[]",
    "number[]",
    "boolean",
    "JSON",
    "HTMLStrict",
    "HTMLPermissive",
    "float",
    "decimal(6)",
    "timestamp",
    "color",
    "text",
)


VALID_TYPES = DATA_TYPES + RELATION_TYPES

OPTIONAL_ATTRIBUTES = (
    "description",
    "calculated",
    "required",
    "read_only",
    "constant",
)


class CheckException(Exception):
    pass


class Checker:
    def __init__(self, filepath: str) -> None:
        with open(filepath, "rb") as x:
            self.models = yaml.safe_load(x.read())
        self.errors: list[str] = []

    def run_check(self) -> None:
        self._run_checks()
        if self.errors:
            errors = [f"\t{error}" for error in self.errors]
            raise CheckException("\n".join(errors))

    def _run_checks(self) -> None:
        for collection in list(self.models.keys()):
            if collection.startswith("_"):
                self.models.pop(collection)
            elif not COLLECTION_REGEX.match(collection):
                self.errors.append(f"Collection '{collection}' is not valid.")
        if self.errors:
            return

        for collection, fields in self.models.items():
            if not isinstance(fields, dict):
                self.errors.append(
                    f"The fields of collection {collection} must be a dict."
                )
                continue
            for field_name, field in fields.items():
                if not FIELD_REGEX.match(field_name):
                    self.errors.append(
                        f"Field name '{field_name}' of collection {collection} is not a valid field name."
                    )
                    continue
                if not isinstance(field, dict):
                    self.errors.append(
                        f"Field '{field_name}' of collection {collection} must be a dict."
                    )
                self.check_field(collection, field_name, field)

        if self.errors:
            return

        for collection, fields in self.models.items():
            for field_name, field in fields.items():
                is_relation_field = field["type"] in RELATION_TYPES
                if not is_relation_field:
                    continue
                error = self.check_relation(collection, field_name, field)
                if error:
                    self.errors.append(error)

    def check_field(
        self,
        collection: str,
        field_name: str,
        field: str | dict[str, Any],
        nested: bool = False,
    ) -> None:
        collectionfield = f"{collection}{KEYSEPARATOR}{field_name}"

        if isinstance(field, str):
            field = cast(dict[str, Any], {"type": field})

        if nested:
            field["restriction_mode"] = (
                "A"  # add restriction_mode to satisfy the checker below.
            )

        type = field.get("type")
        if type not in VALID_TYPES:
            self.errors.append(
                f"Type '{type}' for collectionfield {collectionfield} is invalid."
            )
            return

        required_attributes = [
            "type",
            "restriction_mode",
        ]
        if type in RELATION_TYPES:
            required_attributes.append("to")
        for attr in required_attributes:
            if attr not in field:
                self.errors.append(
                    f"Required attribute '{attr}' for collectionfield {collectionfield} is missing."
                )
                return

        if field.get("calculated"):
            return

        valid_attributes = list(OPTIONAL_ATTRIBUTES) + required_attributes
        if type == "string[]":
            valid_attributes.append("items")
            if "items" in field and "enum" not in field["items"]:
                self.errors.append(
                    f"'items' is missing an inner 'enum' for {collectionfield}"
                )
                return
            for value in field.get("items", {"enum": []})["enum"]:
                self.validate_value_for_type("string", value, collectionfield)
        if type == "JSON" and "default" in field:
            try:
                json.loads(json.dumps(field["default"]))
            except:  # NOQA
                self.errors.append(
                    f"Default value for {collectionfield}' is not valid json."
                )
        if type in ("number", "float", "decimal(6)"):
            valid_attributes.append("minimum")
            if "minimum" in field:
                self.validate_value_for_type(type, field["minimum"], collectionfield)
        if type in ("string", "text"):
            for attr in ("minLength", "maxLength"):
                valid_attributes.append(attr)
                if not isinstance(field.get("maxLength", 0), int):
                    self.errors.append(
                        f"'maxLength' for {collectionfield} is not a number."
                    )
        if type in DATA_TYPES:
            valid_attributes.append("default")
            if "default" in field:
                self.validate_value_for_type(type, field["default"], collectionfield)
            valid_attributes.append("enum")
            if "enum" in field:
                if not isinstance(field["enum"], list):
                    self.errors.append(f"'enum' for {collectionfield} is not a list.")
                for value in field["enum"]:
                    self.validate_value_for_type(type, value, collectionfield)

        if type in RELATION_TYPES:
            valid_attributes.append("on_delete")
            if "on_delete" in field and field["on_delete"] not in (
                "CASCADE",
                "PROTECT",
            ):
                self.errors.append(
                    f"invalid value for 'on_delete' for {collectionfield}"
                )
            valid_attributes.append("equal_fields")
            if nested and type in ("relation", "relation-list"):
                valid_attributes.append("enum")

        for attr in field.keys():
            if attr not in valid_attributes:
                self.errors.append(
                    f"Attribute '{attr}' for collectionfield {collectionfield} is invalid."
                )

        if not isinstance(field.get("description", ""), str):
            self.errors.append(f"Description of {collectionfield} must be a string.")

    def validate_value_for_type(
        self, type_str: str, value: Any, collectionfield: str
    ) -> None:
        basic_types = {
            "string": str,
            "number": int,
            "boolean": bool,
            "HTMLStrict": str,
            "HTMLPermissive": str,
            "timestamp": int,
            "text": str,
        }
        if type_str in basic_types:
            if not isinstance(value, basic_types[type_str]):
                self.errors.append(
                    f"Value '{value}' for '{collectionfield}' is not a {type_str}."
                )
        elif type_str in ("string[]", "number[]"):
            if not isinstance(value, list):
                self.errors.append(
                    f"Value '{value}' for '{collectionfield}' is not a {type_str}."
                )
            for x in value:
                if not isinstance(x, basic_types[type_str[:-2]]):
                    self.errors.append(
                        f"Listentry '{x}' for '{collectionfield}' is not a {type_str[:-2]}."
                    )
        elif type_str == "JSON":
            pass
        elif type_str == "float":
            if type(value) not in (int, float):
                self.errors.append(
                    f"Value '{value}' for '{collectionfield}' is not a float."
                )
        elif type_str == "decimal(6)":
            if not DECIMAL_REGEX.match(value):
                self.errors.append(
                    f"Value '{value}' for '{collectionfield}' is not a decimal(6)."
                )
        elif type_str == "color":
            if not COLOR_REGEX.match(value):
                self.errors.append(
                    f"Value '{value}' for '{collectionfield}' is not a color."
                )
        else:
            raise NotImplementedError(type_str)

    def check_relation(
        self, collection: str, field_name: str, field: dict[str, Any]
    ) -> str | None:
        collectionfield = f"{collection}{KEYSEPARATOR}{field_name}"
        to = field["to"]

        if isinstance(to, str):
            if not COLLECTIONFIELD_REGEX.match(to):
                return f"'to' of {collectionfield} is not a collectionfield."
            return self.check_reverse(collectionfield, to)
        elif isinstance(to, list):
            for cf in to:
                if not COLLECTIONFIELD_REGEX.match(cf):
                    return f"The collectionfield in 'to' of {collectionfield} is not valid."
                error = self.check_reverse(collectionfield, cf)
                if error:
                    return error
        else:
            to_field = to["field"]
            if not FIELD_REGEX.match(to_field):
                return (
                    f"The field '{to_field}' in 'to' of {collectionfield} is not valid."
                )
            for c in to["collections"]:
                if not COLLECTION_REGEX.match(c):
                    self.errors.append(
                        f"The collection '{c}' in 'to' of {collectionfield} is not a valid collection."
                    )
                error = self.check_reverse(
                    collectionfield, f"{c}{KEYSEPARATOR}{to['field']}"
                )
                if error:
                    return error
        return None

    def check_reverse(
        self, from_collectionfield: str, to_collectionfield: str
    ) -> str | None:
        to_unified = []  # a list of target collectionfields (unififed with all
        # the different possibilities for the 'to' field) from the (expected)
        # relation in to_collectionfield. The from_collectionfield must be in this
        # list.

        to_collection, to_field_name = to_collectionfield.split(KEYSEPARATOR)
        if to_collection not in self.models:
            return f"The collection '{to_collection}' in 'to' of {from_collectionfield} is not a valid collection."
        if to_field_name not in self.models[to_collection]:
            return f"The collectionfield '{to_collectionfield}' in 'to' of {from_collectionfield} does not exist."

        to_field = self.models[to_collection][to_field_name]
        if to_field["type"] not in RELATION_TYPES:
            return f"{from_collectionfield} points to {to_collectionfield}, but {to_collectionfield} to is not a relation."

        to = to_field["to"]
        if isinstance(to, str):
            to_unified.append(to)
        elif isinstance(to, list):
            to_unified = to
        else:
            for c in to["collections"]:
                to_unified.append(f"{c}{KEYSEPARATOR}{to['field']}")

        if from_collectionfield not in to_unified:
            return f"{from_collectionfield} points to {to_collectionfield}, but {to_collectionfield} does not point back."
        return None

    def split_collectionfield(self, collectionfield: str) -> tuple[str, str]:
        parts = collectionfield.split(KEYSEPARATOR)
        return parts[0], parts[1]


def main() -> int:
    files = sys.argv[1:]
    if not files:
        files = DEFAULT_FILES

    failed = False
    for f in files:
        try:
            Checker(f).run_check()
        except CheckException as e:
            print(f"Check for {f} failed:\n", e)
            failed = True
        else:
            print(f"Check for {f} successful.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
