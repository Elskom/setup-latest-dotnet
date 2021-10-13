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

    downloadInstallScript(url, dest)
    {
        return new Promise((resolve) => {
            const file = fs.createWriteStream(dest, { flags: "wx" })
            const request = https.get(url, response => {
                if (response.statusCode === 200) {
                    response.pipe(file)
                } else {
                    file.close()
                    fs.unlink(dest, () => {}) // Delete temp file
                    this._printErrorAndExit(`Server responded with ${response.statusCode}: ${response.statusMessage}`)
                }
            })

            request.on("error", err => {
                file.close()
                fs.unlink(dest, () => {}) // Delete temp file
                this._printErrorAndExit(err.message)
            })

            file.on("finish", () => {
                resolve()
            })

            file.on("error", err => {
                file.close()
                if (err.code === "EEXIST") {
                    this._printErrorAndExit("File already exists")
                } else {
                    fs.unlink(dest, () => {}) // Delete temp file
                    this._printErrorAndExit(err.message)
                }
            })
        })
    }

    run()
    {
        if (process.platform === 'win32')
        {
            console.log('Downloading .NET Install script.')

            // Download install script first for Windows.
            this.downloadInstallScript('https://raw.githubusercontent.com/dotnet/install-scripts/main/src/dotnet-install.ps1', `${__dirname}/dotnet-install.ps1`)
            console.log('Download Complete.')

            // Windows.
            this._executeCommand(`${__dirname}/dotnet-install.ps1 -Channel ${this.versionMajor}.${this.versionMinor}.${this.versionBand} -Quality daily`, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
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
