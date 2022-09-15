# setup-latest-dotnet
A github action to install the latest daily build of the .NET SDK. 

```yml

- uses: Elskom/setup-latest-dotnet@main
  with:
    # major version of the .NET SDK to look for the newest version on in the feeds (optional, default is '7').
    VERSION_MAJOR: '7'
    # minor version of the .NET SDK to look for the newest version on in the feeds (optional, default is '0').
    VERSION_MINOR: '0'
    # version band of the .NET SDK to look for the newest version on in the feeds (optional, default is '1xx').
    # for different values look in the dotnet/installer github repository.
    VERSION_BAND: '1xx'
    # The list of versions of the runtime to install.
    # The value below is the default list.
    RUNTIME_VERSIONS: '1.0.16;1.1.13;2.0.9;2.1.30;2.2.8;3.0.3;3.1.29;5.0.17;6.0.10'
```
