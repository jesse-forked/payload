import { Config as GeneratedTypes } from 'payload/generated-types';
import { PayloadRequest } from '../../express/types';
import { Forbidden, NotFound } from '../../errors';
import executeAccess from '../../auth/executeAccess';
import { BeforeOperationHook, Collection } from '../config/types';
import { Document } from '../../types';
import { hasWhereAccessResult } from '../../auth/types';
import { afterRead } from '../../fields/hooks/afterRead';
import { deleteCollectionVersions } from '../../versions/deleteCollectionVersions';
import { deleteAssociatedFiles } from '../../uploads/deleteAssociatedFiles';
import { combineQueries } from '../../database/combineQueries';
import { deleteUserPreferences } from '../../preferences/deleteUserPreferences';
import { killTransaction } from '../../utilities/killTransaction';
import { initTransaction } from '../../utilities/initTransaction';

export type Arguments = {
  depth?: number
  collection: Collection
  id: string | number
  req: PayloadRequest
  overrideAccess?: boolean
  showHiddenFields?: boolean
}

async function deleteByID<TSlug extends keyof GeneratedTypes['collections']>(incomingArgs: Arguments): Promise<Document> {
  let args = incomingArgs;
  const {
    depth,
    collection: {
      config: collectionConfig,
    },
    id,
    req,
    req: {
      t,
      payload,
      payload: {
        config,
      },
    },
    overrideAccess,
    showHiddenFields,
  } = args;

  try {
    const shouldCommit = await initTransaction(req);

    // /////////////////////////////////////
    // beforeOperation - Collection
    // /////////////////////////////////////

    await args.collection.config.hooks.beforeOperation.reduce(async (priorHook: BeforeOperationHook | Promise<void>, hook: BeforeOperationHook) => {
      await priorHook;

      args = (await hook({
        args,
        operation: 'delete',
      })) || args;
    }, Promise.resolve());

    // /////////////////////////////////////
    // Access
    // /////////////////////////////////////

    const accessResults = !overrideAccess ? await executeAccess({ req, id }, collectionConfig.access.delete) : true;
    const hasWhereAccess = hasWhereAccessResult(accessResults);

    // /////////////////////////////////////
    // beforeDelete - Collection
    // /////////////////////////////////////

    await collectionConfig.hooks.beforeDelete.reduce(async (priorHook, hook) => {
      await priorHook;

      return hook({
        req,
        id,
      });
    }, Promise.resolve());

    // /////////////////////////////////////
    // Retrieve document
    // /////////////////////////////////////

    const docToDelete = await req.payload.db.findOne({
      collection: collectionConfig.slug,
      where: combineQueries({ id: { equals: id } }, accessResults),
      locale: req.locale,
      req,
    });


    if (!docToDelete && !hasWhereAccess) throw new NotFound(t);
    if (!docToDelete && hasWhereAccess) throw new Forbidden(t);


    await deleteAssociatedFiles({ config, collectionConfig, doc: docToDelete, t, overrideDelete: true });

    // /////////////////////////////////////
    // Delete document
    // /////////////////////////////////////


    let result = await req.payload.db.deleteOne({
      collection: collectionConfig.slug,
      where: { id: { equals: id } },
      req,
    });


    // /////////////////////////////////////
    // Delete Preferences
    // /////////////////////////////////////

    deleteUserPreferences({
      payload,
      collectionConfig,
      ids: [id],
      req,
    });

    // /////////////////////////////////////
    // Delete versions
    // /////////////////////////////////////

    if (collectionConfig.versions) {
      deleteCollectionVersions({
        payload,
        id,
        slug: collectionConfig.slug,
        req,
      });
    }

    // /////////////////////////////////////
    // afterRead - Fields
    // /////////////////////////////////////

    result = await afterRead({
      depth,
      doc: result,
      entityConfig: collectionConfig,
      overrideAccess,
      req,
      showHiddenFields,
    });

    // /////////////////////////////////////
    // afterRead - Collection
    // /////////////////////////////////////

    await collectionConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
      await priorHook;

      result = await hook({
        req,
        doc: result,
      }) || result;
    }, Promise.resolve());

    // /////////////////////////////////////
    // afterDelete - Collection
    // /////////////////////////////////////

    await collectionConfig.hooks.afterDelete.reduce(async (priorHook, hook) => {
      await priorHook;

      result = await hook({ req, id, doc: result }) || result;
    }, Promise.resolve());

    // /////////////////////////////////////
    // 8. Return results
    // /////////////////////////////////////

    if (shouldCommit) await payload.db.commitTransaction(req.transactionID);

    return result;
  } catch (error: unknown) {
    await killTransaction(req);
    throw error;
  }
}

export default deleteByID;
