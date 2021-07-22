const https = require("https"),
    fs = require("fs")

class Action
{
    constructor()
    {
        this.versionMajor = process.env.version-major
        this.versionMinor = process.env.version-minor
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

    _executeInProcess(cmd)
    {
        var proc = this._executeCommand(cmd, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
        if (proc.status > 0)
        {
            this._printErrorAndExit(`${/error.*/.exec(proc.stdout)[0]}`)
        }
    }

    downloadInstallScript(url, dest)
    {
        return new Promise((resolve, reject) => {
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
        console.log('Downloading .NET Install script.')
        if (process.platform === 'win32')
        {
            // Download install script first for Windows.
            this.downloadInstallScript('https://raw.githubusercontent.com/dotnet/install-scripts/main/src/dotnet-install.ps1', './dotnet-install.ps1')
            console.log('Download Complete.')
            
            // Windows.
            this._executeInProcess(`./dotnet-install.ps1 -Channel ${this.versionMajor}.${this.versionMinor} -Quality daily`)
        }
        else
        {
            // Download install script first for Linux and MacOS.
            this.downloadInstallScript('https://raw.githubusercontent.com/dotnet/install-scripts/main/src/dotnet-install.sh', './dotnet-install.sh')
            console.log('Download Complete.')

            // Linux and MacOS.
            this._executeInProcess(`./dotnet-install.sh --channel ${this.versionMajor}.${this.versionMinor} --quality daily`)
        }
    }
}

const action = new Action();
action.run()
