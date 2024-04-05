namespace db;

using {
  managed,
  cuid
} from '@sap/cds/common';

using {API_PRODUCT} from '../srv/external/API_PRODUCT';

@singular: 'ConditionType'
@plural  : 'ConditionTypes'
entity ConditionTypes : cuid, managed {
  /* "@assert.target" is not possible for remote entity association and will
   *   result in errors
   */
  product : Association to Products @title: 'Product';
}

annotate API_PRODUCT.A_Product with @singular: 'Product'
                                    @plural  : 'Products';


annotate API_PRODUCT.A_ProductDescription with @singular: 'ProductDescription'
                                               @plural  : 'ProductDescriptions';

@singular: 'Product'
@plural  : 'Products'
entity Products            as
  select from API_PRODUCT.A_Product {
    key Product,
        to_Description
  }


@singular: 'ProductDescription'
@plural  : 'ProductDescriptions'
entity ProductDescriptions as
  select from API_PRODUCT.A_ProductDescription {
    key Product,
    key Language,
        ProductDescription
  }
