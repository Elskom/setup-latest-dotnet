const https = require("https"),
    fs = require("fs"),
    path = require("path"),
    spawnSync = require("child_process").spawnSync,
    core = require("@actions/core")

class Action
{
    constructor()
    {
        this.versionMajor = process.env.INPUT_VERSION_MAJOR
        this.versionMinor = process.env.INPUT_VERSION_MINOR
        this.versionBand = process.env.INPUT_VERSION_BAND
        this.runtimeVersions = process.env.INPUT_RUNTIME_VERSIONS.split(';')
        this.sdkVersion = process.env.INPUT_SDK_VERSION
    }

    _printErrorAndExit(msg)
    {
        console.log(`##[error]😭 ${msg}`)
        throw new Error(msg)
    }

    _executeCommand(cmd, options)
    {
        const INPUT = cmd.split(" "), TOOL = INPUT[0], ARGS = INPUT.slice(1)
        return spawnSync(TOOL, ARGS, options)
    }

    _getDotnetRoot()
    {
        // This is the default set in the install-dotnet scripts.
        return process.platform === 'win32' ? path.join(process.env['LocalAppData'] + '', 'Microsoft', 'dotnet') : path.join(process.env['HOME'] + '', '.dotnet')
    }

    _addToPath()
    {
        var dotnetRoot = this._getDotnetRoot()
        if (!process.env['DOTNET_INSTALL_DIR'])
        {
            core.addPath(dotnetRoot)
            core.exportVariable('DOTNET_ROOT', dotnetRoot)
        }

        // Add DOTNET_INSTALL_DIR to path and export the variable DOTNET_ROOT if DOTNET_INSTALL_DIR is set.
        if (process.env['DOTNET_INSTALL_DIR'])
        {
            core.addPath(process.env['DOTNET_INSTALL_DIR'])
            core.exportVariable('DOTNET_ROOT', process.env['DOTNET_INSTALL_DIR'])
        }
    }

    _DotnetInstallCommand()
    {
        return process.platform === 'win32' ? [`pwsh ${__dirname}/dotnet-install.ps1`, '-Channel', '-Quality', '-Version', '-Runtime'] : [`${__dirname}/dotnet-install.sh`, '--channel', '--quality', '--version', '--runtime']
    }

    run()
    {
        var command = this._DotnetInstallCommand()
        this._executeCommand(`${command[0]} ${this.sdkVersion === '' ? `${command[1]} ${this.versionMajor}.${this.versionMinor}.${this.versionBand} ${command[2]} daily` : `${command[3]} ${this.sdkVersion}`}`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
        // Install the runtimes from the list of runtimes.
        for (let runtimeVersion of this.runtimeVersions)
        {
            // install base runtime.
            this._executeCommand(`${command[0]} ${command[3]} ${runtimeVersion.slice(0, runtimeVersion.length - 2)} ${command[4]} dotnet`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
            // install aspnetcore runtime.
            this._executeCommand(`${command[0]} ${command[3]} ${runtimeVersion.slice(0, runtimeVersion.length - 2)} ${command[4]} aspnetcore`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
        }

        this._addToPath()
    }
}

const action = new Action();
action.run()
