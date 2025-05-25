
9:52:01 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
9:51:56 PM: Netlify Build                                                 
9:51:56 PM: ────────────────────────────────────────────────────────────────
9:51:56 PM: ​
9:51:56 PM: ❯ Version
9:51:56 PM:   @netlify/build 33.2.0
9:51:56 PM: ​
9:51:56 PM: ❯ Flags
9:51:56 PM:   accountId: 682f98f5558bea860fc6eb3c
9:51:56 PM:   baseRelDir: true
9:51:56 PM:   buildId: 683277ae88eea10008d742fb
9:51:56 PM:   deployId: 683277ae88eea10008d742fd
9:51:57 PM: ​
9:51:57 PM: ❯ Current directory
9:51:57 PM:   /opt/build/repo
9:51:57 PM: ​
9:51:57 PM: ❯ Config file
9:51:57 PM:   No config file was defined: using default values.
9:51:57 PM: ​
9:51:57 PM: ❯ Context
9:51:57 PM:   production
9:51:57 PM: ​
9:51:57 PM: Build command from Netlify app                                
9:51:57 PM: ────────────────────────────────────────────────────────────────
9:51:57 PM: ​
9:51:57 PM: $ npm run build
9:51:57 PM: > random-location-generator@1.0.0 build
9:51:57 PM: > react-scripts build
9:51:57 PM: Creating an optimized production build...
9:52:00 PM: 
9:52:00 PM: Treating warnings as errors because process.env.CI = true.
9:52:00 PM: Most CI servers set it automatically.
9:52:00 PM: 
9:52:00 PM: Failed to compile.
9:52:00 PM: 
9:52:00 PM: [eslint]
9:52:00 PM: src/randomlocationgenerator.jsx
9:52:00 PM:   Line 256:9:  'hasDrawing' is assigned a value but never used  no-unused-vars
9:52:00 PM: ​
9:52:00 PM: "build.command" failed                                        
9:52:00 PM: ────────────────────────────────────────────────────────────────
9:52:00 PM: ​
9:52:00 PM:   Error message
9:52:00 PM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
9:52:00 PM: ​
9:52:00 PM:   Error location
9:52:00 PM:   In Build command from Netlify app:
9:52:00 PM:   npm run build
9:52:00 PM: ​
9:52:00 PM:   Resolved config
9:52:00 PM:   build:
9:52:00 PM:     command: npm run build
9:52:00 PM:     commandOrigin: ui
9:52:00 PM:     publish: /opt/build/repo/build
9:52:00 PM:     publishOrigin: ui
9:52:01 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
9:52:01 PM: Failing build: Failed to build site
9:52:01 PM: Finished processing build request in 17.426s
