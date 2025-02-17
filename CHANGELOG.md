# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2019-10-21

### Added

- Automatically choose default vshard group in create and edit replicaset modals

- 'Auto' placeholder to weight input in Replicaset add and edit forms.

- 'Select all' and 'Deselect all' buttons to roles field in Replicaset add and edit forms.

- Refresh replicaset list in UI after topology edit actions: bootstrap, join, expel,
  probe, replicaset edit.

- New Lua API `cartridge.http_authorize_request()` suitable for checking
  HTTP request headers.

- New Lua API `cartridge.http_render_response()` for generating HTTP
  response with proper `Set-Cookie` headers.

- New Lua API `cartridge.http_get_username()` to check authorization of
  active HTTP session.

- New Lua API `cartridge.rpc_get_candidates()` to get list
  of instances suitable for performing a remote call.

- Network error notification in UI.

- Allow specifying vshard storage group in test helpers.

### Changed

- Get UI components from Tarantool UI-Kit

- When recovering from snapshot, instances are started read-only.
  It is still possible to override it by argparse (command line
  arguments or environment variables)

### Fixed

- Editing topology with `failover_priority` argument.
- Now `cartridge.rpc.get_candidates()` returns value as specified in doc.
  Also it accepts new option `healthy_only` to filter instances which
  have membership status healthy.

- Replicaset weight tooltip in replicasets list

- Total buckets count in buckets tooltip

- Validation error in user edit form

- Leader flag in server details modal

- Human-readable error for invalid GrqphQL queries:
  `Field "x" is not defined on type "String"`

- User management error "attempt to index nil value" when one of users
  has empty e-mail value

- Catch `rpc_call` errors when they are performed locally

## [1.1.0] - 2019-09-24

### Added

- New Lua API `admin_edit_topology` has been added to unite multiple others:
  `admin_edit_replicaset`, `admin_edit_server`, `admin_join_server`,
  `admin_expel_server`. It's suitable for editing multiple servers/replicasets
  at once. It can be used for bootstrapping cluster from scratch, joining a
  server to an existing replicaset, creating new replicaset with one or more
  servers, editing uri/labels of servers, disabling or expelling servers.

- Similar API is implemented in a GraphQL mutation `cluster{edit_topology()}`.

- New GraphQL mutation `cluster { edit_vshard_options }` is suitable for
  fine-tuning vshard options: `rebalancer_max_receiving`, `collect_lua_garbage`,
  `sync_timeout`, `collect_bucket_garbage_interval`,
  `rebalancer_disbalance_threshold`.

### Changed

- Both bootstrapping from scratch and patching topology in clusterwide config automatically probe
  servers, which aren't added to membership yet (earlier it influenced join_server mutation only).
  This is a prerequisite for multijoin api implementation.

- WebUI users page is hidden if auth_backend doesn't provide list_users callback.

### Deprecated

Lua API:

- `cartridge.admin_edit_replicaset()`
- `cartridge.admin_edit_server()`
- `cartridge.admin_join_server()`
- `cartridge.admin_expel_server()`

GraphQL API:

- `mutation{ edit_replicaset() }`
- `mutation{ edit_server() }`
- `mutation{ join_server() }`
- `mutation{ expel_server() }`

### Fixed

- Protect `users_acl` and `auth` sections when downloading clusterwide config.
  Also forbid uploading them.

## [1.0.0] - 2019-08-29

### Added

- New parameter `topology.replicasets[].all_rw` in clusterwide config for configuring
  all instances in the replicaset as `read_only = false`.
  It can be managed with both GraphQL and Lua API `edit_replicaset`.

- Remote Control server - a partial replacement for the `box.cfg({listen})`, independent on `box.cfg`.
  The server is only to be used internally for bootstrapping new instances.

- New module `argparse` for gathering configuration options from
  command-line arguments, environment variables, and configuration files.
  It is used internally and overrides `cluster.cfg` and `box.cfg` options.

- Auth parameter `cookie_max_age` is now configurable with GraphQL API.
  Also now it's stored in clusterwide config, so changing it on a single server will affect
  all others in cluster.

- Detect that we run under systemd and switch to syslog logging from
  stderr. This allows to filter log messages by severity with
  `journalctl`

- Redesign WebUI

### Changed

- The project renamed to **cartridge**.
  Use `require('cartridge')` instead of `require('cluster')`.
  All submodules are renamed too.
  **(incompatible change)**

- Submodule `cluster.test_helpers` renamed to `cartridge.test-helpers` for consistency.
  **(incompatible change)**

- Modifying auth params with GraphQL before the cluster was bootstrapped is now
  forbidden and returns an error.

- Introducing a new auth parameter `cookie_renew_age`. When cluster handles an HTTP request
  with the cookie, whose age in older then specified, it refreshes the cookie.
  It may be useful to set `cookie_max_age` to a small value (for example 10 minutes),
  so the user will be logged out after `cookie_max_age` seconds of inactivity.
  Otherwise, if he's active, the cookie will be updated every `cookie_renew_age` seconds
  and the session will not be interrupted.

- Changed configuration options for `cluster.cfg()`:
  `roles` now is a mandatory table, `workdir` is optional now (defaults to ".")

- Parameter `advertise_uri` is optional now, default value is derived as follows.
  `advertise_uri` is a compound of `<HOST>` and `<PORT>`.
  When `<HOST>` isn't specified, it's detected as the only non-local IP address.
  If it can't be determined or there is more than one IP address available it
  defaults to `"localhost"`.
  When `<PORT>` isn't specified, it's derived from numeric suffix `_<N>` of
  `TARANTOOL_INSTANCE_NAME`: `<PORT> = 3300+<N>`.
  Otherwise default `<PORT> = 3301` is used.

- Parameter `http_port` is derived from instance name too. If it can't be derived
  it defaults to 8081. New parameter `http_enabled = false` is used to disable it
  (by default it's enabled).

- Removed user `cluster`, which was used internally for orchestration over netbox.
  Tarantool built-in user `admin` is used instead now. It can also be used for HTTP
  authentication to access WebUI. Cluster cookie is used as a password in both cases.
  **(incompatible change)**

### Removed

Two-layer table structure in API, which was deprecated earlier, is now removed completely:

- `cartridge.service_registry.*`
- `cartridge.confapplier.*`
- `cartridge.admin.*`

Instead you can use top-level functions:

- `cartridge.config_get_readonly`
- `cartridge.config_get_deepcopy`
- `cartridge.config_patch_clusterwide`
- `cartridge.service_get`
- `cartridge.admin_get_servers`
- `cartridge.admin_get_replicasets`
- `cartridge.admin_probe_server`
- `cartridge.admin_join_server`
- `cartridge.admin_edit_server`
- `cartridge.admin_expel_server`
- `cartridge.admin_enable_servers`
- `cartridge.admin_disable_servers`
- `cartridge.admin_edit_replicaset`
- `cartridge.admin_get_failover`
- `cartridge.admin_enable_failover`
- `cartridge.admin_disable_failover`

## [0.10.0] - 2019-08-01

### Added

- Cluster can now operate without vshard roles (if you don't need sharding).
  Deprecation warning about implicit vshard roles isn't issued any more,
  they aren't registered unless explicitly specified either in `cluster.cfg({roles=...})`
  or in `dependencies` to one of user-defined roles.

- New role flag `hidden = true`. Hidden roles aren't listed in
  `cluster.admin.get_replicasets().roles` and therefore in WebUI.
  Hidden roles are supposed to be a dependency for another role, yet they still can be
  enabled with `edit_replicaset` function (both Lua and GraphQL).

- New role flag: `permanent = true`.
  Permanent roles are always enabled. Also they are hidden implicitly.

- New functions in cluster test_helpers - `Cluster:upload_config(config)` and `Cluster:download_config()`

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
