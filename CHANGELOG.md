# Changelog

### [6.0.2](https://github.com/npm/npmlog/compare/v6.0.1...v6.0.2) (2022-04-20)


### Dependencies

* update gauge requirement from ^4.0.0 to ^4.0.1 ([cf52b06](https://github.com/npm/npmlog/commit/cf52b06b3221d0d1081c8e5c4162b7f2a9c3549d))
* update gauge requirement from ^4.0.1 to ^4.0.2 ([#96](https://github.com/npm/npmlog/issues/96)) ([53063a9](https://github.com/npm/npmlog/commit/53063a97a3fe2c582c50ccd23b3e3f3a5c633964))
* update gauge requirement from ^4.0.2 to ^4.0.3 ([#101](https://github.com/npm/npmlog/issues/101)) ([929686c](https://github.com/npm/npmlog/commit/929686cf3d91885218380cbec915ecdc6991842d))

### v6.0.0

* Drop support for node 10 and non-lts versions of 12 and 14

### [6.0.1](https://www.github.com/npm/npmlog/compare/v6.0.0...v6.0.1) (2022-02-09)


### Bug Fixes

* evaluate this.heading only once ([3633d33](https://www.github.com/npm/npmlog/commit/3633d3395574fc87d734e31e40f4b19eaa3045c3))
* **notice:** change blue foreground to cyan ([eba1a41](https://www.github.com/npm/npmlog/commit/eba1a413c84bf31d6d0eb2cd3b9254debb07e0fb))


### Dependencies

* @npmcli/template-oss@2.7.1 ([5e7b9f4](https://www.github.com/npm/npmlog/commit/5e7b9f42b5c6b2b32613f5164a4524cc71eeb46f))
* are-we-there-yet@3.0.0 ([7aefa36](https://www.github.com/npm/npmlog/commit/7aefa36320a4265f2825f34db29f129f5927f41b))

### v5.0.1

* update are-we-there-yet to v2.0.0.

### v5.0.0

* Drop support for node versions 6 and 8
* Fix bug where gauge was enabled when paused

### v4.0.2

* Added installation instructions.

### v4.0.1

* Fix bugs where `log.progressEnabled` got out of sync with how `gauge` kept
  track of these things resulting in a progressbar that couldn't be disabled.

### v4.0.0

* Allow creating log levels that are an empty string or 0.

### v3.1.2

* Update to `gauge@1.6.0` adding support for default values for template
  items.

### v3.1.1

* Update to `gauge@1.5.3` to fix to `1.x` compatibility when it comes to
  when a progress bar is enabled.  In `1.x` if you didn't have a TTY the
  progress bar was never shown.  In `2.x` it merely defaults to disabled,
  but you can enable it explicitly if you still want progress updates.

### v3.1.0

* Update to `gauge@2.5.2`:
  * Updates the `signal-exit` dependency which fixes an incompatibility with
    the node profiler.
  * Uses externalizes its ansi code generation in `console-control-strings`
* Make the default progress bar include the last line printed, colored as it
  would be when printing to a tty.

### v3.0.0

* Switch to `gauge@2.0.0`, for better performance, better look.
* Set stderr/stdout blocking if they're tty's, so that we can hide a
  progress bar going to stderr and then safely print to stdout.  Without
  this the two can end up overlapping producing confusing and sometimes
  corrupted output.

### v2.0.0

* Make the `error` event non-fatal so that folks can use it as a prefix.

### v1.0.0

* Add progress bar with `gauge@1.1.0`
