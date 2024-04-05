import cds, { ApplicationService, column_expr } from "@sap/cds";

import {
  Products,
  ProductDescriptions,
  ConditionType,
  ConditionTypes,
} from "#cds-models/ConditionTypesService";
import { Products as ExtProducts } from "#cds-models/API_PRODUCT";

export default class ConditionTypesService extends ApplicationService {
  override async init() {
    const extSrv = await cds.connect.to("API_PRODUCT");

    this.on("READ", ProductDescriptions, async (req) => {
      if (!this.isInQuery(req.query.SELECT?.from?.ref, "to_Description")) {
        // value help doesn't follow association, but reads directly on ProductDescriptions
        (req.query as any).where(`Language = '${req.locale.toUpperCase()}'`);
        return extSrv.run(req.query);
      } else {
        // List View follows associations from Condition-types (local)  > Products (remote) > ProductDescriptions (remote)
        const id = this.extractIdFromQuery(req.query.SELECT?.from?.ref);
        if (id.length == 0) {
          return;
        }
        const product = await SELECT.one(ConditionTypes)
          .where(`ID = '${id}'`)
          .columns((a) => a.product_Product);

        return extSrv.run(
          SELECT.from(ProductDescriptions)
            .where(
              `Language = '${req.locale.toUpperCase()}' AND Product = '${
                product.product_Product
              }'`
            )
            .columns((a) => {
              a.Language, a.Product, a.ProductDescription;
            })
        );
      }
    });

    this.on("READ", Products, (req) => {
      return extSrv.run(req.query);
    });

    this.before("SAVE", ConditionType.drafts, async (req) => {
      // manual @assert.target check because no support exists here
      if (req.data.product_Product) {
        const prodData = await extSrv.run(
          SELECT.one
            .from(ExtProducts)
            .columns((a) => a.Product)
            .where({ Product: req.data.product_Product })
        );
        if (!prodData?.Product) {
          throw req.error(
            422,
            `Product ${req.data.product_Product} does not exist`,
            "product_Product"
          );
        }
      }
    });
    await super.init();
  }

  private extractIdFromQuery(
    ref:
      | (string & {
          id?: string | undefined;
          where?: cds.expr | undefined;
          args?: cds.expr[] | undefined;
        })[]
      | undefined
  ): string {
    const indexId = ref?.findIndex(
      ({ id }) => id && id.startsWith("ConditionTypesService.ConditionTypes") // also .drafts occur after navigating back from detail to list page
    );
    if (typeof indexId === "undefined" || (indexId as number) < 0) {
      return "";
    }

    const idWhere = ref?.at(indexId)?.where;
    let id = "";
    if (
      idWhere &&
      Array.isArray(idWhere) &&
      idWhere.length == 3 &&
      idWhere[0].ref &&
      Array.isArray(idWhere[0].ref) &&
      idWhere[0].ref.length === 1 &&
      idWhere[0].ref[0] === "ID" &&
      idWhere[1] === "=" &&
      idWhere[2].val
    ) {
      return idWhere[2].val;
    } else {
      return "";
    }
  }

  private isInQuery(
    queryElement: column_expr[] | [{ ref: string[] }] | [string[]] | undefined,
    name: string
  ): boolean {
    if (!queryElement) {
      return false;
    }
    const index = queryElement.findIndex(
      (line) =>
        (typeof line === "object" &&
          "ref" in line &&
          line.ref &&
          line.ref[0] === name) ||
        line === name
    );
    return index >= 0;
  }
}
