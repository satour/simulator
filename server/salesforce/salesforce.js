'use strict'

const logger = require('winston')
const jsforce = require('jsforce')
const config = require('../../config/server')

class Salesforce {
  /**
   * @param  {Object} options
   */
  constructor () {
    this.connection = new jsforce.Connection()

    if (!(config.salesforce.user && config.salesforce.pass && config.salesforce.token)) {
      this.loggedIn = Promise.reject('Environment variables are missing')
      return
    }

    this.loggedIn = this.connection.login(config.salesforce.user, `${config.salesforce.pass}${config.salesforce.token}`)
    logger.info('salesforce#connecting')
  }

  /**
   * @param {Array} assets
   */
  addAssets (assets) {
    assets = assets.map((a) => ({
      Name: a.product,
      SerialNumber: a.serial,
      xively__Device_ID__c: a.deviceId,
      Contact: { xively__XI_End_User_ID__c: a.orgId }
    }))

    this.loggedIn
      .then(() => this.connection.sobject('Asset').upsertBulk(assets, 'xively__Device_ID__c'))
      .then((results) => {
        results.forEach((result, idx) => {
          if (result.success) {
            logger.info('Salesforce #addAssets', `inserted successfully: ${assets[idx].SerialNumber}`)
          } else {
            throw result
          }
        })
      })
      .catch((err) => {
        logger.error('Salesforce #addAssets', err)
      })
  }

  /**
   * @param {Array} cases
   */
  addCases (cases) {
    cases = cases.map((c) => ({
      Subject: c.subject,
      Description: c.description,
      Contact: { xively__XI_End_User_ID__c: c.orgId },
      Asset: { xively__Device_ID__c: c.deviceId },
      xively__XI_Device_ID__c: c.deviceId
    }))
    return this.loggedIn
      .then(() => this.connection.sobject('Case').insert(cases))
      .then((results) => {
        results.forEach((result, idx) => {
          if (!result.success) {
            throw result
          }
          logger.info('Salesforce #addCases', `inserted successfully: ${cases[idx].Subject}`)
        })
      })
      .catch((err) => {
        logger.error('Salesforce #addCases', err)
      })
  }

  /**
   * @param {Array} contacts
   */
  addContacts (contacts) {
    contacts = contacts.map((c) => ({
      Email: c.email,
      xively__XI_End_User_ID__c: c.orgId
    }))

    // TODO limit
    this.loggedIn
      .then(() => this.connection.sobject('Contact').upsert(contacts.slice(0, 10), 'xively__XI_End_User_ID__c'))
      .then((results) => {
        results.forEach((result, idx) => {
          if (!result.success) {
            throw result
          }
          logger.info('Salesforce #addContacts', `inserted successfully: ${contacts[idx].Email}`)
        })
      })
      .catch((err) => {
        logger.error('Salesforce #addContacts', err)
      })
  }

  /**
   * @param {String} id
   */
  retrieveContact (id) {
    return this.loggedIn
      .then(() => this.connection.sobject('Contact').retrieve(id))
  };
}

module.exports = new Salesforce()
