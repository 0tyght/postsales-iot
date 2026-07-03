#define MyAppName "Post-Sales IoT Local Server"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "TYT"
#define SourceDir "..\..\release\customer-local"

[Setup]
AppId={{8B8373E8-6D2A-4C78-9B0D-504F53545341}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName=C:\PostSalesIoT
DisableDirPage=no
DefaultGroupName=Post-Sales IoT
OutputDir=..\..\release
OutputBaseFilename=PostSales-IoT-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Install / Configure Server"; Filename: "{app}\installer\install-customer-local.bat"; WorkingDir: "{app}"
Name: "{group}\Start Server Manually"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\scripts\start-postsales-server.ps1"" -InstallDir ""{app}"""; WorkingDir: "{app}"
Name: "{group}\Backup"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\scripts\backup.ps1"" -ConfigPath ""{app}\installer\config.json"""; WorkingDir: "{app}"

[Run]
Filename: "{app}\installer\install-customer-local-no-service.bat"; Description: "Install files and prepare initial server"; Flags: postinstall skipifsilent
