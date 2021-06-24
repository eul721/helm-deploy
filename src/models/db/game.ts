import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE, AtLeastOne } from '../../utils/database';
import { AgreementCreationAttributes, AgreementModel } from './agreement';
import { BuildCreationAttributes, BuildModel } from './build';
import { BranchCreationAttributes, BranchModel } from './branch';
import { DivisionModel } from './division';
import { RoleModel } from './role';
import { Fields, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';
import { Locale, LocalizedHashmap } from '../../utils/language';
import { PublicGameDescription } from '../http/public/publicgamedescription';
import { DownloadData } from '../http/public/downloaddata';
import { PublisherGameDescription } from '../http/rbac/publishergamedescription';

export const GameDef: ModelAttributes = {
  id: INTERNAL_ID(),
  contentfulId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsTitleId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
  defaultBranch: INTERNAL_ID_REFERENCE(),
  ownerId: INTERNAL_ID_REFERENCE(),
};

export interface GameAttributes {
  bdsTitleId: number;
  contentfulId: string | null;
  defaultBranch: number | null;
  id: number;
  ownerId: number;
  readonly branches?: BranchModel[];
  readonly builds?: BuildModel[];
  readonly owner?: DivisionModel;
  readonly rolesWithGame?: RoleModel[];
}

export type GameCreationAttributes = Optional<GameAttributes, 'id' | 'defaultBranch' | 'ownerId' | 'contentfulId'>;

export type GameUniqueIdentifier = AtLeastOne<Pick<GameAttributes, 'id' | 'bdsTitleId' | 'contentfulId'>>;

export class GameModel extends LocalizableModel<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;

  public bdsTitleId!: number;

  public contentfulId!: string | null;

  public defaultBranch!: number | null;

  public ownerId!: number;

  // #region association: agreements

  public readonly agreements?: AgreementModel[];

  public createAgreement!: HasManyCreateAssociationMixin<AgreementModel>;

  public addAgreement!: HasManyAddAssociationMixin<AgreementModel, number>;

  public removeAgreement!: HasManyRemoveAssociationMixin<AgreementModel, number>;

  public getAgreements!: HasManyGetAssociationsMixin<AgreementModel>;

  public createAgreementEntry(attributes: AgreementCreationAttributes): Promise<AgreementModel> {
    return this.createAgreement(attributes);
  }
  // #endregion

  // #region association: builds
  public readonly builds?: BuildModel[];

  public createBuild!: HasManyCreateAssociationMixin<BuildModel>;

  public addBuild!: HasManyAddAssociationMixin<BuildModel, number>;

  public removeBuild!: HasManyRemoveAssociationMixin<BuildModel, number>;

  public getBuilds!: HasManyGetAssociationsMixin<BuildModel>;

  public createBuildEntry(attributes: BuildCreationAttributes): Promise<BuildModel> {
    return this.createBuild(attributes);
  }
  // #endregion

  // #region association: branches
  public readonly branches?: BranchModel[];

  public createBranch!: HasManyCreateAssociationMixin<BranchModel>;

  public addBranch!: HasManyAddAssociationMixin<BranchModel, number>;

  public removeBranch!: HasManyRemoveAssociationMixin<BranchModel, number>;

  public getBranches!: HasManyGetAssociationsMixin<BranchModel>;

  public createBranchEntry(attributes: BranchCreationAttributes): Promise<BranchModel> {
    return this.createBranch(attributes);
  }

  public async getDefaultBranchModel(): Promise<BranchModel> {
    return ((await this.getBranches({
      where: {
        id: this.defaultBranch,
      },
    })) ?? [])[0];
  }

  public setDefaultBranch(branchId: number) {
    this.set('defaultBranch', branchId);
    return this.save();
  }

  // #endregion

  // #region association: localizedfields

  public get names(): LocalizedHashmap {
    return (
      this.fields?.reduce<LocalizedHashmap>((acc, fieldData) => {
        if (Fields.name === fieldData.field) {
          acc[fieldData.locale] = fieldData.value;
        }
        return acc;
      }, {}) ?? {}
    );
  }

  public async addName(value: string, locale: Locale) {
    return this.upsertLocalizedField(Fields.name, value, locale);
  }

  public async getName(locale: Locale): Promise<string | undefined> {
    return this.getLocalizedField(Fields.name, locale);
  }

  public async getNames() {
    return this.getLocalizedFields(Fields.name);
  }

  public async removeName(locale: Locale) {
    return this.removeLocalizedField(Fields.name, locale);
  }

  // #endregion

  // #region association: roles
  public readonly rolesWithGame?: RoleModel[];

  public createRolesWithGame!: HasManyCreateAssociationMixin<RoleModel>;

  public removeRolesWithGame!: HasManyRemoveAssociationMixin<RoleModel, number>;

  public getRolesWithGame!: BelongsToManyGetAssociationsMixin<RoleModel>;
  // #endregion

  // #region association: owner
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    agreements: Association<GameModel, AgreementModel>;
    branches: Association<GameModel, BranchModel>;
    builds: Association<GameModel, BuildModel>;
    fields: Association<GameModel, LocalizedFieldModel>;
    owner: Association<GameModel, DivisionModel>;
    roles: Association<GameModel, RoleModel>;
    rolesWithGame: Association<GameModel, RoleModel>;
  };

  public toPublicHttpModel(): PublicGameDescription {
    return {
      bdsTitleId: this.bdsTitleId,
      contentfulId: this.contentfulId ?? '',
      id: this.id,
      names: this.names,
    };
  }

  public toPublisherHttpModel(): PublisherGameDescription {
    return {
      bdsTitleId: this.bdsTitleId,
      branches: this.branches?.map(branch => branch.toPublisherHttpModel()) ?? [],
      builds: this.builds?.map(build => build.toPublisherHttpModel()) ?? [],
      contentfulId: this.contentfulId,
      defaultBranchId: this.defaultBranch,
      divisionId: this.ownerId,
      id: this.id,
      names: this.names,
    };
  }

  // TODO: no builds data on branch, there is no versions info anymore, sending all builds for now
  public toDownloadHttpModel(branch: BranchModel): DownloadData {
    return {
      ...this.toPublicHttpModel(),
      branch: branch.toPublicHttpModel(),
      agreements: this.agreements?.map(agreementData => agreementData.toHttpModel()) ?? [],
      versions: this.builds?.map(build => build.toPublicHttpModel()) ?? [],

      // TODO: transfer former contentful spec to SQL
      supportedLanguages: ['mocklanguage1', 'mocklanguage2'],
    };
  }
}
