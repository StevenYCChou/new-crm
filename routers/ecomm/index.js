var express = require('express');
var router = express.Router();

var businessService = require('../../business_service/business_service.js');
var managerFacade = businessService.managerFacade;
var agentFacade = businessService.agentFacade;
var customerFacade = businessService.customerFacade;

var entryPages = require('../../entryPages.js');
router.get('/', entryPages.crmHomepage);
router.get('/about', entryPages.crmAboutpage);

////////////////////
// Manager Facade //
////////////////////
router.get('/agents', managerFacade.showAllAgents);
router.get('/agents/create', managerFacade.showAgentCreationPage);

//////////////////
// Agent Facade //
//////////////////

// profile related
router.get('/agents/:agentId', agentFacade.showProfile);
router.get('/agents/:agentId/edit', agentFacade.showProfileUpdatePage);

// customer related
router.get('/agents/:agentId/customers/:customerId', agentFacade.showCustomerDetailPage);
router.get('/agents/:agentId/create', agentFacade.showCustomerCreationPage);
router.get('/agents/:agentId/customers/:customerId/edit', agentFacade.showCustomerUpdatePage);

// contact record related
router.get('/contact_records/create', agentFacade.showContactRecordCreationPage);
router.get('/contact_records/:contactRecordId', agentFacade.retrieveContactRecordById);

/////////////////////
// Customer Facade //
/////////////////////
router.get('/customers/:customerId', customerFacade.retrieveProfilePage);
router.get('/customers/:customerId/edit', customerFacade.showProfileUpdatePage);

module.exports = router;