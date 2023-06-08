import { pool1, sql } from "../utils/common.js";
import fetch from "node-fetch";

const ThirdPartyController = {

    async CreateLicences(req, res) {
        try {
            const memberID = req.body.memberID;

            let result = await pool1
                .request()
                .query(
                    `SELECT gcpGLNID, gln, ISNULL(gcp_type,'GCP') as gcp_type, status, company_name_eng FROM dbo.users WHERE id = ${memberID}`
                );

            if (!result) {
                return res.status(400).json({ error: "Could not fetch user data." });
            }

            let data = result.recordsets[0];
            let responseArray = [];

            for (let i = 0; i < data.length; i++) {
                let licenseKey = data[i].gcpGLNID;
                let licenseeName = data[i].company_name_eng;
                let licenseGLN = data[i].gln;
                let licenceType = data[i].gcp_type;
                let licenseStatus = data[i].status === 0 ? "INACTIVE" : "ACTIVE";

                let body = [
                    {
                        licenceKey: licenseKey,
                        licenceType: licenceType,
                        licenceStatus: licenseStatus,
                        licenseeName: licenseeName,
                        licenseeGLN: licenseGLN,
                    },
                ];

                const apiResponse = await fetch("https://grp.gs1.org/grp-st/v3/licences", {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                        APIKey: "35864a0c5a424e26bddfb6357f791b30",
                    },
                });

                if (!apiResponse.ok) {
                    return res.status(500).json({ error: `Failed to create licence: ${apiResponse.statusText}` });
                }

                const json = await apiResponse.json();
                responseArray.push(json);
            }
            return res.status(200).json({ result: responseArray, message: "inserted/modified" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    async CreateOrModifyGTINsWithLicence(req, res) {
        try {
            const memberID = req.body.memberID;

            let query = `SELECT status,gcp_type,gcpGLNID,unit,countrySale, prod_lang, barcode,ISNULL(productnameenglish,'No Value')as productnameenglish,ISNULL(front_image,'No Value')as front_image,BrandName,size,dbo.udf_GetNumeric(gpc) as gpc,gpc_code
            FROM dbo.products WHERE user_id = @memberID`;

            let request = pool1.request();
            request.input("memberID", sql.NVarChar, memberID);

            let result = await request.query(query);

            if (!result) {
                return res.status(400).json({ error: "Could not fetch product data." });
            }

            let data = result.recordsets[0];
            let responseArray = [];

            for (let i = 0; i < data.length; i++) {
                let gtins = "0" + data[i].barcode;
                let gpcCategoryCode = data[i].gpc_code;
                let valuesName = data[i].BrandName;
                let valuesProduct = data[i].productnameenglish;
                let valuesImage = data[i].front_image;
                let size = data[i].size;
                let gtinstatus = data[i].status;
                let licenceKey = data[i].gcpGLNID;
                let licenceType = data[i].gcp_type;
                let language = data[i].prod_lang;
                let unitCode = data[i].unit;
                let countryOfSaleCode = data[i].countrySale;
                let gtinStatus = gtinstatus == 0 ? "INACTIVE" : "ACTIVE";

                const body = [
                    {
                        gtin: gtins,
                        gtinStatus: gtinStatus,
                        gpcCategoryCode: gpcCategoryCode,
                        licenceKey: licenceKey,
                        licenceType: licenceType,
                        brandName: [
                            {
                                language: language,
                                value: valuesName,
                            },
                        ],
                        productDescription: [
                            {
                                language: language,
                                value: valuesProduct,
                            },
                        ],
                        productImageUrl: [
                            {
                                language: language,
                                value: valuesImage,
                            },
                        ],
                        netContent: [
                            {
                                unitCode: unitCode,
                                value: size,
                            },
                        ],
                        countryOfSaleCode: [countryOfSaleCode],
                    },
                ];

                const apiResponse = await fetch("https://grp.gs1.org/grp-st/v3/gtins", {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                        APIKey: "35864a0c5a424e26bddfb6357f791b30",
                    },
                });

                if (!apiResponse.ok) {
                    return res.status(500).json({ error: `Failed to create or modify GTIN: ${apiResponse.statusText}` });
                }

                const json = await apiResponse.json();
                responseArray.push(json);
            }
            return res.status(200).json({ result: responseArray, message: "inserted/modified" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An unexpected error occurred.', message: 'invalid data' });
        }
    },


    async BulkGtinWithLicence(req, res) {
        try {
            let products = { ...req.body }
            let responseArray = [];
            let P = [];
            P.push(products.importBulkArray);

            for (let i = 0; i < P.length; i++) {
                let gtins = P[i].gtins;
                let gpcCategoryCode = String(P[i].gpcCategoryCode);
                let valuesName = P[i].valuesName;
                let valuesProduct = P[i].valuesProduct;
                let valuesImage = P[i].valuesImage || "No Value";
                let size = String(P[i].size);
                let gtinstatus = P[i].gtinstatus;
                let licenceKey = P[i].licenceKey.trim();
                let licenceType = P[i].licenceType.trim();
                let language = P[i].language;
                let unitCode = P[i].unitCode;
                let countryOfSaleCode = P[i].countryOfSaleCode;

                let gtinStatus = "";
                if (Number(gtinstatus) == 0) {
                    gtinStatus = "INACTIVE";
                } else {
                    gtinStatus = "ACTIVE";
                }

                const body = [
                    {
                        gtin: gtins,
                        gtinStatus: gtinStatus,
                        gpcCategoryCode: gpcCategoryCode,
                        licenceKey: licenceKey,
                        licenceType: licenceType,
                        brandName: [
                            {
                                language: language,
                                value: valuesName,
                            },
                        ],
                        productDescription: [
                            {
                                language: language,
                                value: valuesProduct,
                            },
                        ],
                        productImageUrl: [
                            {
                                language: language,
                                value: valuesImage,
                            },
                        ],
                        netContent: [
                            {
                                unitCode: unitCode,
                                value: size,
                            },
                        ],
                        countryOfSaleCode: [countryOfSaleCode],
                    },
                ];

                const data = await fetch("https://grp.gs1.org/grp-st/v3/gtins", {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                        APIKey: "35864a0c5a424e26bddfb6357f791b30",
                    },
                });
                const response = await data.json();
                responseArray.push(response);
            }

            res.json({ result: responseArray, message: "inserted/modified" });

        } catch (err) {
            res.json({
                err: err,
                message: "invalid data",
            });
        }
    },




};

export default ThirdPartyController;
