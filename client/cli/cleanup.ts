import { spawn } from 'child_process';

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
};

const spawnChildProcess = (
    command: string,
    { onData = data => process.stdout.write(data.toString()) }: { onData?: (data: Buffer) => void } = {}
) => {
    return new Promise<number>(resolve => {
        console.log(`${command}: Starting process...`);
        const startTime = new Date().getTime();
        const child = spawn(command, { shell: true });

        // write to the console
        child.stdout.on(`data`, data => onData(data));

        // print errors
        child.stderr.on(`data`, data => process.stdout.write(data.toString()));

        child.on(`close`, code => {
            const endTime = new Date().getTime();
            console.log(`\n\r`);
            console.log(`${command}: Finished with code ${code}.`);
            console.log(`${command}: Execution took ${Math.round((endTime - startTime) / 1000)} s.\n\r`);
            resolve(code);
        });
    });
};

const doLinting = async () => {
    return await spawnChildProcess(`npm run lint-write`);
};

const doPrettifying = async () => {
    return await spawnChildProcess(`npm run prettify-write`, {
        onData: data => {
            process.stdout.write(data.toString());
            setTimeout(() => clearLastLine(), 2);
        }
    });
};

(async () => {
    const lintFinishCode = await doLinting();
    const prettifyFinishCode = await doPrettifying();
    if (lintFinishCode + prettifyFinishCode === 0) {
        console.log(`Cleanup finishes successfully.`);
    } else {
        console.log(`Cleanup finishes with an error.`);
    }
})();
