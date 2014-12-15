var express = require('express');
var router = express.Router();

var businessService = require('../../business_service/business_service.js');
var managerFacade = businessService.managerFacade;
var agentFacade = businessService.agentFacade;
var customerFacade = businessService.customerFacade;

var entryPages = require('../../entryPages.js');

router.get('/', entryPages.ecommHomepage);
router.get('/about', entryPages.ecommAboutpage)

/////////////////////
// Ecommerce-Manager Facade //
/////////////////////
router.get('/managers/products', managerFacade.showProductsPage);
router.get('/managers/createProduct', managerFacade.createProductsPage);
router.get('/managers/product/:productId', managerFacade.showProductDetail);

/////////////////////
// Ecommerce-Customer Facade //
/////////////////////
router.get('/customers/products', customerFacade.showProductsPage);
router.get('/customers/product/:productId', customerFacade.showProductDetail);

module.exports = router;