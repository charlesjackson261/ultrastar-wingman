/**
 * UltraStar Wingman
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */


import ApiClient from "../ApiClient";
import HTTPValidationError from '../model/HTTPValidationError';

/**
* Website service.
* @module api/WebsiteApi
* @version 1.1.0
*/
export default class WebsiteApi {

    /**
    * Constructs a new WebsiteApi. 
    * @alias module:api/WebsiteApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }


    /**
     * Callback function to receive the result of the avatarAvatarsAvatarGet operation.
     * @callback module:api/WebsiteApi~avatarAvatarsAvatarGetCallback
     * @param {String} error Error message, if any.
     * @param {Object} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Avatar
     * @param {Object} avatar 
     * @param {module:api/WebsiteApi~avatarAvatarsAvatarGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Object}
     */
    avatarAvatarsAvatarGet(avatar, callback) {
      let postBody = null;
      // verify the required parameter 'avatar' is set
      if (avatar === undefined || avatar === null) {
        throw new Error("Missing the required parameter 'avatar' when calling avatarAvatarsAvatarGet");
      }

      let pathParams = {
        'avatar': avatar
      };
      let queryParams = {
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = Object;
      return this.apiClient.callApi(
        '/avatars/{avatar}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }


}
