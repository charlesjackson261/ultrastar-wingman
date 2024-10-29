/**
 * UltraStar Wingman
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */


import ApiClient from "../ApiClient";
import BasicResponse from '../model/BasicResponse';
import HTTPValidationError from '../model/HTTPValidationError';
import OrderEnum from '../model/OrderEnum';
import USDBSongsResponse from '../model/USDBSongsResponse';
import UdEnum from '../model/UdEnum';
import UsdbId from '../model/UsdbId';
import UsdbIdsList from '../model/UsdbIdsList';

/**
* USDB service.
* @module api/USDBApi
* @version 2.0.0
*/
export default class USDBApi {

    /**
    * Constructs a new USDBApi. 
    * @alias module:api/USDBApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }


    /**
     * Callback function to receive the result of the apiUsdbDownloadApiUsdbDownloadPost operation.
     * @callback module:api/USDBApi~apiUsdbDownloadApiUsdbDownloadPostCallback
     * @param {String} error Error message, if any.
     * @param {module:model/BasicResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Downloads the song with the given USDB ID
     * @param {module:model/UsdbId} usdbId 
     * @param {module:api/USDBApi~apiUsdbDownloadApiUsdbDownloadPostCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/BasicResponse}
     */
    apiUsdbDownloadApiUsdbDownloadPost(usdbId, callback) {
      let postBody = usdbId;
      // verify the required parameter 'usdbId' is set
      if (usdbId === undefined || usdbId === null) {
        throw new Error("Missing the required parameter 'usdbId' when calling apiUsdbDownloadApiUsdbDownloadPost");
      }

      let pathParams = {
      };
      let queryParams = {
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = ['OAuth2PasswordBearer'];
      let contentTypes = ['application/json'];
      let accepts = ['application/json'];
      let returnType = BasicResponse;
      return this.apiClient.callApi(
        '/api/usdb/download', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiUsdbIdsApiUsdbIdsGet operation.
     * @callback module:api/USDBApi~apiUsdbIdsApiUsdbIdsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/UsdbIdsList} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the list of all downloaded USDB IDs
     * @param {module:api/USDBApi~apiUsdbIdsApiUsdbIdsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/UsdbIdsList}
     */
    apiUsdbIdsApiUsdbIdsGet(callback) {
      let postBody = null;

      let pathParams = {
      };
      let queryParams = {
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = ['OAuth2PasswordBearer'];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = UsdbIdsList;
      return this.apiClient.callApi(
        '/api/usdb/ids', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiUsdbSongsApiUsdbSongsGet operation.
     * @callback module:api/USDBApi~apiUsdbSongsApiUsdbSongsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/USDBSongsResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Search Songs
     * @param {Object} opts Optional parameters
     * @param {String} [artist] Filter songs by the artist's name.
     * @param {Array.<String>} [artistList] Can only be used combined with fuzzy - will search for each artist individually and combine the results.
     * @param {String} [title] Filter songs by title.
     * @param {String} [edition] Filter by the song's edition.
     * @param {String} [language] Filter songs by language.
     * @param {String} [genre] Filter songs by genre.
     * @param {module:model/OrderEnum} [order] Sort the result by this order criteria.
     * @param {module:model/UdEnum} [ud] Sort order: ascending (asc) or descending (desc).
     * @param {Boolean} [golden = false)] 
     * @param {Boolean} [songcheck = false)] 
     * @param {Number} [limit = 30)] The number of songs to return per page.
     * @param {Number} [page = 1)] Page number for pagination.
     * @param {Boolean} [fuzzy = false)] If the search should be fuzzy. This will split things like 'remastered' from the title and searches for each artist individually. When using fuzzy, no proper paging will be available - make sure the query is tight enough to not include too many entries.
     * @param {module:api/USDBApi~apiUsdbSongsApiUsdbSongsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/USDBSongsResponse}
     */
    apiUsdbSongsApiUsdbSongsGet(opts, callback) {
      opts = opts || {};
      let postBody = null;

      let pathParams = {
      };
      let queryParams = {
        'artist': opts['artist'],
        'artist_list': this.apiClient.buildCollectionParam(opts['artistList'], 'multi'),
        'title': opts['title'],
        'edition': opts['edition'],
        'language': opts['language'],
        'genre': opts['genre'],
        'order': opts['order'],
        'ud': opts['ud'],
        'golden': opts['golden'],
        'songcheck': opts['songcheck'],
        'limit': opts['limit'],
        'page': opts['page'],
        'fuzzy': opts['fuzzy']
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = ['OAuth2PasswordBearer'];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = USDBSongsResponse;
      return this.apiClient.callApi(
        '/api/usdb/songs', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }


}
