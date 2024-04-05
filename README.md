# Using an entity of a remote API as value help entity in Fiori Elements

> **Note**: Follow this [link](https://github.com/stockbal/cap-samples/tree/main) to show all available scenarios

## Description

The scenario is the same as described in [remote-srv-complex](https://github.com/stockbal/cap-samples/tree/remote-srv-vh-complex), but applies an alternative to the programmatic approach: Instead of manipulating the column for the description field and filtering data via code, this approach uses this built-in mechanism:
```JavaScript
    this.on("READ", ProductDescriptions, (req) => {
      (req.query as any).where(`Language = '${req.locale.toUpperCase()}'`);
      return extSrv.run(req.query);
    });
```
As you can see, the TypeScript interface doesn't provide access to the .where()-method, which doesn't replace the original where-clause, but extends the existing with "and". But, the method is available and also mentioned by the [learning journey](https://learning.sap.com/learning-journeys/build-side-by-side-extensions-on-sap-btp/exercise-adding-an-external-service_d73e2e9b-3002-41dc-bb0b-b390048eaf4c) in the step to reduce the number of business partners without names.

In consequence you should be able see the same results, if you run both examples in comparison.

Additionally, in this example, I've also added in the list report page the product description. This column requires to implement the behaviour of a deep expand of `ConditionTypes/product/to_Description`. Unfortunately, due to getting the `ID` from the `ConditionTypes` makes the logic in the event handler more complex, as it needs to be extracted from the query. With the extracted ID the name of the `Product`, and respectively the description of the `ProductDescription` can be determined.

## Testing

Install all dependencies via `npm i`.

### Using the script `watch:onprem`

This npm script is assuming that you have defined the following profile in either `.cdsrc-private.json` or a `.env` file.

Template for `.cdsrc-private.json`:

```json
{
  "cds": {
    "requires": {
      "API_PRODUCT": {
        "[onprem]": {
          "credentials": {
            "url": "<url to API_PRODUCT_SRV on S/4HANA system: e.g. http://host:port/sap/opu/odata/API_PRODUCT_SRV",
            "authentication": "BasicAuthentication",
            "username": "<sap system user>",
            "password": "<sap system password>"
          }
        }
      }
    }
  }
}
```

When the file is created, you should be able to test the application with `npm run watch:onprem` against your S/4HANA system
