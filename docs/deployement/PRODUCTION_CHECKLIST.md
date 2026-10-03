# Production Checklist

## Build

- [ ] Dependencies install successfully
- [ ] ESLint passes without errors
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Security tests pass
- [ ] PWA tests pass
- [ ] Statistical tests pass
- [ ] Coverage thresholds pass
- [ ] Production build succeeds

## Security

- [ ] HTTPS enabled
- [ ] CSP reviewed
- [ ] Security headers configured
- [ ] No hard-coded secrets
- [ ] No sensitive values committed
- [ ] No unnecessary third-party scripts
- [ ] No unnecessary external connections
- [ ] Service worker reviewed
- [ ] Storage behavior reviewed
- [ ] Clipboard behavior reviewed

## Privacy

- [ ] Passwords are processed locally
- [ ] PINs are processed locally
- [ ] Passphrases are processed locally
- [ ] Sensitive values are not intentionally persisted
- [ ] Clipboard auto-clear tested
- [ ] Sensitive-field clearing tested
- [ ] Privacy documentation is current

## PWA

- [ ] Manifest loads
- [ ] Icons load
- [ ] Service worker registers
- [ ] Offline page works
- [ ] Cached application loads offline
- [ ] Service-worker updates work
- [ ] Installation prompt works where supported

## Manual Browser Testing

- [ ] Password generation
- [ ] Password analysis
- [ ] Entropy calculation
- [ ] Pattern detection
- [ ] Passphrase generation
- [ ] PIN generation
- [ ] Clipboard copying
- [ ] Clipboard auto-clear
- [ ] Theme switching
- [ ] Accessibility controls
- [ ] Mobile layout
- [ ] Offline mode

## Deployment

- [ ] Production domain configured
- [ ] HTTPS verified
- [ ] Security headers verified
- [ ] CSP verified
- [ ] Service worker verified
- [ ] Cache version verified
- [ ] Production build deployed
- [ ] Deployment manually tested

## Release

- [ ] README updated
- [ ] Architecture documentation updated
- [ ] Security documentation updated
- [ ] Threat model updated
- [ ] Deployment documentation updated
- [ ] Changelog updated
- [ ] Git tag created