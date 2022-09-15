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

    run()
    {
        if (process.platform === 'win32')
        {
            // Windows.
            this._executeCommand(`pwsh ${__dirname}/dotnet-install.ps1 -Channel ${this.versionMajor}.${this.versionMinor}.${this.versionBand} -Quality daily`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
            // Install the runtimes from the list of runtimes.
            for (let runtimeVersion of this.runtimeVersions)
            {
                if (runtimeVersion === '6.0.x')
                {
                    // install base runtime.
                    this._executeCommand(`pwsh ${__dirname}/dotnet-install.ps1 -Channel 6.0 -Quality daily -Runtime dotnet`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                    // install aspnetcore runtime.
                    this._executeCommand(`pwsh ${__dirname}/dotnet-install.ps1 -Channel 6.0 -Quality daily -Runtime aspnetcore`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                }
                else
                {
                    // install base runtime.
                    this._executeCommand(`pwsh ${__dirname}/dotnet-install.ps1 -Version ${runtimeVersion} -Runtime dotnet`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                    // install aspnetcore runtime.
                    this._executeCommand(`pwsh ${__dirname}/dotnet-install.ps1 -Version ${runtimeVersion} -Runtime aspnetcore`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                }
            }
            if (!process.env['DOTNET_INSTALL_DIR'])
            {
                // This is the default set in install-dotnet.ps1
                core.addPath(path.join(process.env['LocalAppData'] + '', 'Microsoft', 'dotnet'))
                core.exportVariable('DOTNET_ROOT', path.join(process.env['LocalAppData'] + '', 'Microsoft', 'dotnet'))
            }
        }
        else
        {
            // Linux and MacOS.
            this._executeCommand(`${__dirname}/dotnet-install.sh --channel ${this.versionMajor}.${this.versionMinor}.${this.versionBand} --quality daily`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
            // Install the runtimes from the list of runtimes.
            for (let runtimeVersion of this.runtimeVersions)
            {
                if (runtimeVersion === '6.0.x')
                {
                    // install base runtime.
                    this._executeCommand(`${__dirname}/dotnet-install.sh --channel 6.0 --quality daily --runtime dotnet`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                    // install aspnetcore runtime.
                    this._executeCommand(`${__dirname}/dotnet-install.sh --channel 6.0 --quality daily --runtime aspnetcore`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                }
                else
                {
                    // install base runtime.
                    this._executeCommand(`${__dirname}/dotnet-install.sh --version ${runtimeVersion} --runtime dotnet`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                    // install aspnetcore runtime.
                    this._executeCommand(`${__dirname}/dotnet-install.sh -Version ${runtimeVersion} --runtime aspnetcore`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
                }
            }
            if (!process.env['DOTNET_INSTALL_DIR'])
            {
                // This is the default set in install-dotnet.sh
                core.addPath(path.join(process.env['HOME'] + '', '.dotnet'))
                core.exportVariable('DOTNET_ROOT', path.join(process.env['HOME'] + '', '.dotnet'))
            }
        }

        // Add DOTNET_INSTALL_DIR to path and export the variable DOTNET_ROOT if DOTNET_INSTALL_DIR is set.
        if (process.env['DOTNET_INSTALL_DIR'])
        {
            core.addPath(process.env['DOTNET_INSTALL_DIR'])
            core.exportVariable('DOTNET_ROOT', process.env['DOTNET_INSTALL_DIR'])
        }
    }
}

const action = new Action();
action.run()
