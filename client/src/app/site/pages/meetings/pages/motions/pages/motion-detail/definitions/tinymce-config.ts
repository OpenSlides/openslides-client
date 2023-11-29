import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

export const MotionTinyMceConfig = {
    style_formats: [
        {
            title: _(`Headers`),
            items: [
                { title: _(`Header 1`), format: `h1` },
                { title: _(`Header 2`), format: `h2` },
                { title: _(`Header 3`), format: `h3` },
                { title: _(`Header 4`), format: `h4` },
                { title: _(`Header 5`), format: `h5` },
                { title: _(`Header 6`), format: `h6` }
            ]
        },
        {
            title: _(`Inline`),
            items: [
                { title: _(`Bold`), icon: `bold`, format: `bold` },
                { title: _(`Italic`), icon: `italic`, format: `italic` },
                { title: _(`Underline`), icon: `underline`, format: `underline` },
                { title: _(`Strikethrough`), format: `strikethrough` },
                { title: _(`Superscript`), icon: `superscript`, format: `superscript` },
                { title: _(`Subscript`), icon: `subscript`, format: `subscript` },
                { title: _(`Code`), format: `code` }
            ]
        },
        {
            title: _(`Blocks`),
            items: [
                { title: _(`Paragraph`), format: `p` },
                { title: _(`Div`), format: `div` },
                { title: _(`Pre`), format: `pre` }
            ]
        },
        {
            title: _(`Alignment`),
            items: [
                { title: _(`Left`), format: `alignleft` },
                { title: _(`Center`), format: `aligncenter` },
                { title: _(`Right`), format: `alignright` }
            ]
        }
    ]
};
