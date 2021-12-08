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
```
