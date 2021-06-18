import { getDBInstance } from '../../models/db/database';
import { GameModel } from '../../models/db/game';
import { Locale } from '../../utils/language';
import { SampleDatabase } from '../../utils/sampledatabase';

describe('src/models/game', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await GameModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(GameModel.prototype.createAgreement).toBeDefined();
      expect(GameModel.prototype.addAgreement).toBeDefined();
      expect(GameModel.prototype.removeAgreement).toBeDefined();
      expect(GameModel.prototype.getAgreements).toBeDefined();

      expect(GameModel.prototype.createBuild).toBeDefined();
      expect(GameModel.prototype.addBuild).toBeDefined();
      expect(GameModel.prototype.removeBuild).toBeDefined();
      expect(GameModel.prototype.getBuilds).toBeDefined();

      expect(GameModel.prototype.createBranch).toBeDefined();
      expect(GameModel.prototype.addBranch).toBeDefined();
      expect(GameModel.prototype.removeBranch).toBeDefined();
      expect(GameModel.prototype.getBranches).toBeDefined();

      expect(GameModel.prototype.getOwner).toBeDefined();

      expect(GameModel.prototype.createRolesWithGame).toBeDefined();
      expect(GameModel.prototype.removeRolesWithGame).toBeDefined();
      expect(GameModel.prototype.getRolesWithGame).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await GameModel.findOne({
        where: { id: testDb.gameCiv6.id },
        include: [
          GameModel.associations.agreements,
          GameModel.associations.builds,
          GameModel.associations.branches,
          GameModel.associations.owner,
          GameModel.associations.rolesWithGame,
        ],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();

      expect(modelWithAssociations?.agreements?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.builds?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.branches?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.rolesWithGame?.length).toBeGreaterThan(0);
    });
  });

  describe('when manipulating Name localized fields', () => {
    let testGame: GameModel | null;
    let locale: Locale;

    beforeEach(async () => {
      testGame = await GameModel.create({
        bdsTitleId: 12345,
        ownerId: 1,
      });
    });

    describe('when no names exist', () => {
      it('should return a blank name', async () => {
        expect(await testGame?.getName(Locale.en)).toBeUndefined();
      });

      it('should return all names as a blank object', async () => {
        expect(await testGame?.getNames()).toStrictEqual({});
      });
    });

    describe('when adding one English name', () => {
      beforeEach(async () => {
        locale = Locale.en;
        await testGame?.addName('Test Name 1', locale);
      });

      it('should return the new name', async () => {
        expect(await testGame?.getName(locale)).toEqual('Test Name 1');
      });

      describe('when adding a second name of the same locale', () => {
        beforeEach(async () => {
          await testGame?.addName('Test Name 2', locale);
        });

        it('should return the newly edited name', async () => {
          expect(await testGame?.getName(locale)).toEqual('Test Name 2');
        });
      });

      describe('when adding a Spanish name', () => {
        beforeEach(async () => {
          await testGame?.addName('Test Nombre 3', Locale.es);
        });

        it('should return the proper localized name', async () => {
          expect(await testGame?.getName(Locale.en)).toEqual('Test Name 1');
          expect(await testGame?.getName(Locale.es)).toEqual('Test Nombre 3');
        });

        it('should return all names properly', async () => {
          const result = await testGame?.getNames();
          expect(result).toHaveProperty(Locale.en, 'Test Name 1');
          expect(result).toHaveProperty(Locale.es, 'Test Nombre 3');
        });
      });
    });

    describe('when removing an existing name', () => {
      beforeEach(async () => {
        await testGame?.addName('Remove Me Name 1', Locale.en);
        await testGame?.addName('Remove Mi Nombre 1', Locale.es);
      });

      it('should remove only the specified name', async () => {
        const oldFields = await testGame?.getNames();
        expect(oldFields).toHaveProperty(Locale.en, 'Remove Me Name 1');
        expect(oldFields).toHaveProperty(Locale.es, 'Remove Mi Nombre 1');

        await testGame?.removeName(Locale.en);

        expect(await testGame?.getName(Locale.en)).toBeUndefined();
        expect(await testGame?.getName(Locale.es)).toEqual('Remove Mi Nombre 1');
      });
    });

    describe('when two games exist', () => {
      let testGame2: GameModel | null;

      beforeEach(async () => {
        testGame2 = await GameModel.create({
          bdsTitleId: 23456,
          ownerId: 2,
        });
      });

      describe('when game1 has a name', () => {
        beforeEach(async () => {
          await testGame?.addName('Test Name 6', Locale.en);
        });

        it('should remain empty', async () => {
          expect(await testGame2?.getName(Locale.en)).toBeUndefined();
        });
      });

      describe('when setting game2 name', () => {
        beforeEach(async () => {
          await testGame?.addName('Test Name 1', Locale.en);
          await testGame2?.addName('Test Name 8', Locale.en);
        });

        it('should not match game1', async () => {
          const game1Name = await testGame?.getName(Locale.en);
          const game2Name = await testGame2?.getName(Locale.en);
          expect(game1Name).not.toEqual(game2Name);
          expect(game1Name).not.toBeUndefined();
          expect(game2Name).not.toBeUndefined();
        });
      });
    });
  });
});
