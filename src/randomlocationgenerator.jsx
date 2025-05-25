
10:16:57 PM: Netlify Build                                                 
10:16:57 PM: ────────────────────────────────────────────────────────────────
10:16:57 PM: ​
10:16:57 PM: ❯ Version
10:16:57 PM:   @netlify/build 33.2.0
10:16:57 PM: ​
10:16:57 PM: ❯ Flags
10:16:57 PM:   accountId: 682f98f5558bea860fc6eb3c
10:16:57 PM:   baseRelDir: true
10:16:57 PM:   buildId: 68327d7becc95f00087279c0
10:16:57 PM:   deployId: 68327d7becc95f00087279c2
10:16:57 PM: ​
10:16:57 PM: ❯ Current directory
10:16:57 PM:   /opt/build/repo
10:16:57 PM: ​
10:16:57 PM: ❯ Config file
10:16:57 PM:   No config file was defined: using default values.
10:16:57 PM: ​
10:16:57 PM: ❯ Context
10:16:57 PM:   production
10:16:57 PM: ​
10:16:57 PM: Build command from Netlify app                                
10:16:57 PM: ────────────────────────────────────────────────────────────────
10:16:57 PM: ​
10:16:57 PM: $ npm run build
10:16:58 PM: > random-location-generator@1.0.0 build
10:16:58 PM: > react-scripts build
10:16:58 PM: Creating an optimized production build...
10:17:01 PM: 
10:17:01 PM: Treating warnings as errors because process.env.CI = true.
10:17:01 PM: Most CI servers set it automatically.
10:17:01 PM: 
10:17:01 PM: Failed to compile.
10:17:01 PM: 
10:17:01 PM: [eslint]
10:17:01 PM: src/randomlocationgenerator.jsx
10:17:01 PM:   Line 191:9:  'getGoogleMapsUrl' is assigned a value but never used  no-unused-vars
10:17:01 PM: ​
10:17:01 PM: "build.command" failed                                        
10:17:01 PM: ────────────────────────────────────────────────────────────────
10:17:01 PM: ​
10:17:01 PM:   Error message
10:17:01 PM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
10:17:01 PM: ​
10:17:01 PM:   Error location
10:17:01 PM:   In Build command from Netlify app:
10:17:01 PM:   npm run build
10:17:01 PM: ​
10:17:01 PM:   Resolved config
10:17:01 PM:   build:
10:17:01 PM:     command: npm run build
10:17:01 PM:     commandOrigin: ui
10:17:01 PM:     publish: /opt/build/repo/build
10:17:01 PM:     publishOrigin: ui
10:17:02 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
10:17:02 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
10:17:02 PM: Failing build: Failed to build site
10:17:02 PM: Finished processing build request in 22.869s
