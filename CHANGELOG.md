# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New API `patch_topology` suitable for editing multiple servers/replicasets
  at once. It can be used for bootstrapping cluster from scratch,
  joining a server to an existing replicaset, creating new replicaset with
  one or more servers, editing uri/labels of servers,
  disabling or expelling servers.

### Fixed

- `cluster.call_rpc` used to return 'Role unavailable' error as a first argument
  instead of `nil, err`. It can appear when role is specified in clusterwide config,
  but wasn't initialized properly. There are two reasons for that: race condition,
  or prior error in either role `init` or `apply_config` methods.

## [0.9.2] - 2019-07-12

### Fixed

- Update frontend-core dependency which used to litter
  `package.loaded` with tons of JS code

## [0.9.1] - 2019-07-10

### Added

- Support for vshard groups in WebUI

### Fixed

- Uniform handling vshard group 'default' when
  multiple groups aren't configured
- Requesting multiple vshard groups info before the cluster
  was bootstrapped

## [0.9.0] - 2019-07-02

### Added

- User management page in WebUI
- Configuring multiple isolated vshard groups in a single cluster
- Support for joining multiple instances in a single call to config_patch_clusterwide
- Integration tests helpers

### Changed

- GraphQL API `known_roles` format now includes roles dependencies

- `cluster.rpc_call` option `remote_only` renamed to `prefer_local`
  with the opposite meaning

### Fixed

- Don't display renamed or removed roles in webui
- Uploading config without a section removes it from clusterwide config

## [0.8.0] - 2019-05-20

### Added

- Specifying role dependencies
- Set read-only option for slave nodes
- Labels for servers

### Changed

- Admin http endpoint changed from /graphql to /admin/api
- Graphql output now contains null values for empty objects

- Deprecate implicity of vshard roles
  `'cluster.roles.vshard-storage'`, `'cluster.roles.vshard-router'`.
  Now they should be specified explicitly in `cluster.cfg({roles = ...})`

- `cluster.service_get('vshard-router')` now returns
  `cluster.roles.vshard-router` module instead of `vshard.router`
  **(incompatible change)**

- `cluster.service_get('vshard-storage')` now returns
  `cluster.roles.vshard-storage` module instead of `vshard.storage`
  **(incompatible change)**

- `cluster.admin.bootstrap_vshard` now can be called on any instance


### Fixed

- Operating vshard-storage roles before vshard was bootstrapped

## [0.7.0] - 2019-04-05

### Added

- Failover priority configuration using WebUI
- Remote calls across cluster instances using `cluster.rpc` module
- Displaying box.cfg and box.info in WebUI
- Authorization for HTTP API and WebUI
- Configuration download/upload via WebUI
- Lua API documentation, which you can read with `tarantoolctl rocks doc cluster` command.

### Changed

- Instance restart now triggers config validation before roles initialization
- Update WebUI design
- Lua API changed (old functions still work, but issue warnings):
  - `cluster.confapplier.*` -> `cluster.config_*`
  - `cluster.service_registry.*` -> `cluster.service_*`

## [0.6.3] - 2019-02-08

### Fixed

- Cluster used to call 'validate()' role method instead of documented
  'validate_config()', so it was added. The undocumented 'validate()'
  still may be used for the sake of compatibility, but issues a warning
  that it was deprecated.

## [0.6.2] - 2019-02-07

### Fixed

- Minor internal corner cases

## [0.6.1] - 2019-02-05

### Fixed

- UI/UX: Replace "bootstrap vshard" button with a noticable panel
- UI/UX: Replace failover panel with a small button

## [0.6.0] - 2019-01-30

### Fixed

- Ability to disable vshard-storage role when zero-weight rebalancing finishes
- Active master indication during failover
- Other minor improvements

### Changed

- New frontend core
- Dependencies update
- Call to `join_server` automatically does `probe_server`

### Added

- Servers filtering by roles, uri, alias in WebUI

## [0.5.1] - 2018-12-12

### Fixed

- WebUI errors

## [0.5.0] - 2018-12-11

### Fixed

- Graphql mutations order

### Changed

- Callbacks in user-defined roles are called with `is_master` parameter,
  indicating state of the instance
- Combine `cluster.init` and `cluster.register_role` api calls in single `cluster.cfg`
- Eliminate raising exceptions
- Absorb http server in `cluster.cfg`

### Added

- Support of vshard replicaset weight parameter
- `join_server()` `timeout` parameter to make call synchronous

## [0.4.0] - 2018-11-27

### Fixed/Improved

- Uncaught exception in WebUI
- Indicate when backend is unavailable
- Sort servers in replicaset, put master first
- Cluster mutations are now synchronous, except joining new servers

### Added

- Lua API for temporarily disabling servers
- Lua API for implementing user-defined roles

## [0.3] - 2018-10-30

### Changed

- Config structure **incompatible** with v0.2

### Added

- Explicit vshard master configuration
- Automatic failover (switchable)
- Unit tests

## [0.2] - 2018-10-01

### Changed

- Allow vshard bootstrapping from ui
- Several stability improvements

## [0.1] - 2018-09-25

### Added

- Basic functionality
- Integration tests
- Luarock-based packaging
- Gitlab CI integration
