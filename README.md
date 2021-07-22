# setup-latest-dotnet
A github action to install the latest daily build of the .NET SDK. 

```yml

- uses: Elskom/setup-latest-dotnet@main
  with:
    # major version of the .NET SDK to look for the newest version on in the feeds.
    VERSION_MAJOR: '6'
    # minor version of the .NET SDK to look for the newest version on in the feeds.
    VERSION_MINOR: '0'
```
