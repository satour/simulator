'use strict'

const BlueprintClient = require('../server/vendor/blueprint-client-node.js')
const request = require('request-promise')
const logger = require('winston')

const blueprint = {

  /**
   * Used in testing provisioning via accounts.json file
   */
  useDemoAccount () {
    try {
      const account = require('../accounts')[0]
      console.log('Using accounts.json data %j', account)
      // Override env properties
      process.env.XIVELY_ACCOUNT_ID = account.accountId
      process.env.XIVELY_APP_ID = account.appId
      process.env.XIVELY_APP_TOKEN = account.appToken
      process.env.XIVELY_ACCOUNT_USER_NAME = account.username
      process.env.XIVELY_ACCOUNT_USER_PASSWORD = account.password
      process.env.XIVELY_IDM_HOST = 'id.demo.xively.com'
      process.env.XIVELY_BLUEPRINT_HOST = 'blueprint.demo.xively.com'
      process.env.XIVELY_BROKER_HOST = 'broker.demo.xively.com'
      process.env.XIVELY_TIMESERIES_HOST = 'timeseries.demo.xively.com'
    } catch (err) {
      // Fail silently
    }
  },

  /**
   * Authorize with the IDM server and yield a new state object with a `jwt` property.
   * @return {String}
   */
  getJwt (options) {
    return request({
      url: `https://${process.env.XIVELY_IDM_HOST}/api/v1/auth/login-user`,
      method: 'POST',
      headers: {
        AccessToken: process.env.XIVELY_APP_TOKEN
      },
      json: {
        accountId: process.env.XIVELY_ACCOUNT_ID,
        emailAddress: process.env.XIVELY_ACCOUNT_USER_NAME,
        password: process.env.XIVELY_ACCOUNT_USER_PASSWORD
      }
    })
    .then((res) => res.jwt)
  },

  /**
   * Create a new Blueprint client and yield a new client
   * @param  {String} jwt
   * @return {Promise}
   */
  getClient (jwt) {
    return new BlueprintClient({
      authorization: `Bearer ${jwt}`,
      docsUrl: `https://${process.env.XIVELY_BLUEPRINT_HOST}/docs`
    }).ready
  },

  createOrganizationTemplates (organizationTemplates) {
    logger.info('Creating: organization templates')
    return this.create({
      apiMethod: 'organizationsTemplates',
      responseField: 'organizationTemplate',
      items: organizationTemplates
    })
  },

  createDeviceTemplates (deviceTemplates) {
    logger.info('Creating: device templates')
    return this.create({
      apiMethod: 'devicesTemplates',
      responseField: 'deviceTemplate',
      items: deviceTemplates
    })
  },

  createOrganizations (organizations) {
    logger.info('Creating: organizations')
    return this.create({
      apiMethod: 'organizations',
      responseField: 'organization',
      items: organizations
    })
  },

  createDevices (devices) {
    logger.info('Creating: devices')
    return this.create({
      apiMethod: 'devices',
      responseField: 'device',
      items: devices
    })
  },

  createDeviceFields (fields) {
    logger.info('Creating: device fields')
    return this.create({
      apiMethod: 'devicesCustomFields',
      responseField: 'deviceField',
      items: fields
    })
  },

  createChannelTemplates (channelTemplates) {
    logger.info('Creating: channel templates')
    return this.create({
      apiMethod: 'channelsTemplates',
      responseField: 'channelTemplate',
      items: channelTemplates
    })
  },

  createEndUserTemplates (endUserTemplates) {
    logger.info('Creating: end user templates')
    return this.create({
      apiMethod: 'endUsersTemplates',
      responseField: 'endUserTemplate',
      items: endUserTemplates
    })
  },

  createEndUser (endUser) {
    logger.info('Creating: end user')
    return this.create({
      apiMethod: 'endUsers',
      responseField: 'endUser',
      items: endUser
    })
  },

  createMqttCredentials (entities) {
    logger.info('Creating: mqtt credentials')
    return this.create({
      apiMethod: 'accessMqttCredentials',
      responseField: 'mqttCredential',
      items: entities
    })
  },

  create (options) {
    if (!this.client) {
      this.client = this.getJwt()
        .then((jwt) => this.getClient(jwt))
    }

    const apiMethod = options.apiMethod
    const responseField = options.responseField
    const items = options.items
    return this.client.then((client) => {
      return Promise.all(items.map((item) => {
        const body = JSON.stringify(Object.assign({ accountId: process.env.XIVELY_ACCOUNT_ID }, item))
        return client.apis[apiMethod].create({ body })
          .then((response) => response.obj[responseField])
      }))
    })
  }
}

module.exports = blueprint
