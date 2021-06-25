# 1.0.0 (2021-06-24)


### Bug Fixes

* add missing secret ref in deployment ([787aba3](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/787aba38009c8ef2a0c193b5297af64204246f7c))
* add missing secret ref in deployment ([2b03fa9](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/2b03fa988df3c560d8ca8bc3e413d32639b9c533))
* adds createdAt/updatedAt to Game model ([330c59d](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/330c59d1e19f9c1073158d1fb3b2b530bdac09bb))
* chart name for downloader ([d703638](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/d7036381f2a4ba748876e67faa85a0e0d0650cbe))
* cleans up types surrounding SortPair ([a2056c7](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/a2056c7249d771a3172c38e4c64f7fcd541afcba))
* commandline escaping ([a749a81](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/a749a815b9af6fd5a38c2c021958efbced707519))
* enables 'develop' to be a valid isDev environment as well ([#34](https://github.com/take-two-t2gp/t2gp-publisher-service/issues/34)) ([8530a7e](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/8530a7ecf35683834316069939ec1e2e1a8d6cbc))
* enables debugger window to default to origin instead of hardcoded to localhost ([70c96bb](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/70c96bbf0e3bd47abbd19816fde8c527377e99db))
* fixes debugger page to support re-init even after fail ([6ed2205](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/6ed2205d136b5024fc776bd67e15167b5c8f8b58))
* include entire pagination context in response ([f16ff56](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/f16ff56d0cd24674a7ec918e30717befe6bb268a))
* missed test case correction ([daae1e6](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/daae1e61ae74337020aa5a2bab7608fdcaa59d18))
* refactors the PaginatedResponse to be a bit cleaner and be an intersection type ([fd593ba](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/fd593bab4f2cdd622745f4f21be9ade9de4c03b7))
* remove linebreak ([07924ca](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/07924ca6ffa2ad4e7832c4ca58ddbe5a30be5b5e))
* remove terraform default ([d8b6698](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/d8b6698436b19939256f1532541924994ae47264))
* removes the singular form of a localized field for game and agreement ([#38](https://github.com/take-two-t2gp/t2gp-publisher-service/issues/38)) ([246f170](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/246f1709a09f4622c024a3187f20ceae484056fc))
* removes usage of resource middleware on 'all-games' Publisher endpoint ([ab3b697](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/ab3b69790e80b7769dfeac6a59a72aa56321641d))
* temp move axios from devdeps to deps ([6bc16c3](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/6bc16c3825ba196af68fcbf461ee13d705e19ea5))
* trim PageData response to only include from,total ([d427f8e](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/d427f8ed1a8f46225d217f63128d0ba5c65483a2))
* upgrades @take-two-t2gp/t2gp-node-toolkit for new JWTv2 support ([#43](https://github.com/take-two-t2gp/t2gp-publisher-service/issues/43)) ([5455b9d](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/5455b9d3dc990333defe5dd196db802baa24ff11))
* use DNA_APP_SECRET instead of incorrect TOKEN ([#37](https://github.com/take-two-t2gp/t2gp-publisher-service/issues/37)) ([dae0975](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/dae0975af20097e5557b6e7e38b6af737b0ee71b))
* use proper sendMessage helper ([429a857](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/429a857814e87034caf9cf299784bfb971be2dcb))
* yaml newline problems ([9e4e545](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/9e4e545fd20067d54f2b9af0a5bed071973b2125))


### Features

* adds better pagination internals, including multi-sort-support ([5bb468a](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/5bb468a83d8ba7e80b3c2e7bc8dabb7b1b29abb7))
* adds debug console prototype to enable remote access for development purposes only ([#30](https://github.com/take-two-t2gp/t2gp-publisher-service/issues/30)) ([f8b9cd7](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/f8b9cd743813a8afb7ee7c20b07ff85501dabe40))
* adds GET /api/publisher/games ([236dceb](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/236dceb0174bab845ce0c833380ce5e4063bd8da))
* adds pagination capabilities to Publisher service calls ([0a0adcf](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/0a0adcfd1efa6b8a0aaa91562474f52613d88ec8))
* adds SQL (MariaDB in dev/prd, SQLite in Test for in-memory support) ([bb02895](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/bb02895dd2bd15d8916d154bce4064ec54784fb3))
* improves splitting of models and light relational coverage ([2eeadc5](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/2eeadc5f61ce15a2970c50172e5d2767d2eb851a))
* localizes URLs in Agreement ([#46](https://github.com/take-two-t2gp/t2gp-publisher-service/issues/46)) ([348b4dc](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/348b4dcac822462e4096ecf68bfb24bcacee4c60))
* new APIs for publisher - get games/get game ([1b7ad74](https://github.com/take-two-t2gp/t2gp-publisher-service/commit/1b7ad7461eac6ba5a9e5fdc8c84bb750f7bfec73))
