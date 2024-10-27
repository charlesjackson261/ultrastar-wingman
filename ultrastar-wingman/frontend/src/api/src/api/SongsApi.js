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
import SingModel from '../model/SingModel';
import Song from '../model/Song';
import SongScoresModel from '../model/SongScoresModel';
import SongsResponse from '../model/SongsResponse';

/**
* Songs service.
* @module api/SongsApi
* @version 2.0.0
*/
export default class SongsApi {

    /**
    * Constructs a new SongsApi. 
    * @alias module:api/SongsApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }


    /**
     * Callback function to receive the result of the apiCoverApiSongsSongIdCoverGet operation.
     * @callback module:api/SongsApi~apiCoverApiSongsSongIdCoverGetCallback
     * @param {String} error Error message, if any.
     * @param {Object} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Api Cover
     * @param {Object} songId 
     * @param {module:api/SongsApi~apiCoverApiSongsSongIdCoverGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Object}
     */
    apiCoverApiSongsSongIdCoverGet(songId, callback) {
      let postBody = null;
      // verify the required parameter 'songId' is set
      if (songId === undefined || songId === null) {
        throw new Error("Missing the required parameter 'songId' when calling apiCoverApiSongsSongIdCoverGet");
      }

      let pathParams = {
        'song_id': songId
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
      let returnType = Object;
      return this.apiClient.callApi(
        '/api/songs/{song_id}/cover', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiGetSongByIdApiSongsSongIdGet operation.
     * @callback module:api/SongsApi~apiGetSongByIdApiSongsSongIdGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Song} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Retrieve the song with the given id. Use id 'random' for a random song or 'current' for the currently playing song.
     * @param {Object} songId 
     * @param {module:api/SongsApi~apiGetSongByIdApiSongsSongIdGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Song}
     */
    apiGetSongByIdApiSongsSongIdGet(songId, callback) {
      let postBody = null;
      // verify the required parameter 'songId' is set
      if (songId === undefined || songId === null) {
        throw new Error("Missing the required parameter 'songId' when calling apiGetSongByIdApiSongsSongIdGet");
      }

      let pathParams = {
        'song_id': songId
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
      let returnType = Song;
      return this.apiClient.callApi(
        '/api/songs/{song_id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiGetSongByIdApiSongsSongIdScoresGet operation.
     * @callback module:api/SongsApi~apiGetSongByIdApiSongsSongIdScoresGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SongScoresModel} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * All the scores for a given song (matched by USDX Id, so the scores might belong to different files).
     * @param {Object} songId 
     * @param {module:api/SongsApi~apiGetSongByIdApiSongsSongIdScoresGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SongScoresModel}
     */
    apiGetSongByIdApiSongsSongIdScoresGet(songId, callback) {
      let postBody = null;
      // verify the required parameter 'songId' is set
      if (songId === undefined || songId === null) {
        throw new Error("Missing the required parameter 'songId' when calling apiGetSongByIdApiSongsSongIdScoresGet");
      }

      let pathParams = {
        'song_id': songId
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
      let returnType = SongScoresModel;
      return this.apiClient.callApi(
        '/api/songs/{song_id}/scores', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiGetSongLookupApiSongLookupGet operation.
     * @callback module:api/SongsApi~apiGetSongLookupApiSongLookupGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SongsResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Searches for the given title and artist in the downloaded songs. Title and artist will be normalized to allow for slightly different spellings.
     * @param {String} title 
     * @param {Array.<String>} artists 
     * @param {module:api/SongsApi~apiGetSongLookupApiSongLookupGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SongsResponse}
     */
    apiGetSongLookupApiSongLookupGet(title, artists, callback) {
      let postBody = null;
      // verify the required parameter 'title' is set
      if (title === undefined || title === null) {
        throw new Error("Missing the required parameter 'title' when calling apiGetSongLookupApiSongLookupGet");
      }
      // verify the required parameter 'artists' is set
      if (artists === undefined || artists === null) {
        throw new Error("Missing the required parameter 'artists' when calling apiGetSongLookupApiSongLookupGet");
      }

      let pathParams = {
      };
      let queryParams = {
        'title': title,
        'artists': this.apiClient.buildCollectionParam(artists, 'multi')
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = ['OAuth2PasswordBearer'];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = SongsResponse;
      return this.apiClient.callApi(
        '/api/song_lookup', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiMp3ApiSongsSongIdMp3Get operation.
     * @callback module:api/SongsApi~apiMp3ApiSongsSongIdMp3GetCallback
     * @param {String} error Error message, if any.
     * @param {Object} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Api Mp3
     * @param {Object} songId 
     * @param {module:api/SongsApi~apiMp3ApiSongsSongIdMp3GetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Object}
     */
    apiMp3ApiSongsSongIdMp3Get(songId, callback) {
      let postBody = null;
      // verify the required parameter 'songId' is set
      if (songId === undefined || songId === null) {
        throw new Error("Missing the required parameter 'songId' when calling apiMp3ApiSongsSongIdMp3Get");
      }

      let pathParams = {
        'song_id': songId
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
      let returnType = Object;
      return this.apiClient.callApi(
        '/api/songs/{song_id}/mp3', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiSingSongApiSongsSongIdSingPost operation.
     * @callback module:api/SongsApi~apiSingSongApiSongsSongIdSingPostCallback
     * @param {String} error Error message, if any.
     * @param {module:model/BasicResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Starts UltraStar Deluxe and loads the song
     * @param {Object} songId 
     * @param {module:model/SingModel} singModel 
     * @param {module:api/SongsApi~apiSingSongApiSongsSongIdSingPostCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/BasicResponse}
     */
    apiSingSongApiSongsSongIdSingPost(songId, singModel, callback) {
      let postBody = singModel;
      // verify the required parameter 'songId' is set
      if (songId === undefined || songId === null) {
        throw new Error("Missing the required parameter 'songId' when calling apiSingSongApiSongsSongIdSingPost");
      }
      // verify the required parameter 'singModel' is set
      if (singModel === undefined || singModel === null) {
        throw new Error("Missing the required parameter 'singModel' when calling apiSingSongApiSongsSongIdSingPost");
      }

      let pathParams = {
        'song_id': songId
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
        '/api/songs/{song_id}/sing', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiSongsApiSongsGet operation.
     * @callback module:api/SongsApi~apiSongsApiSongsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SongsResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Retrieve all downloaded songs
     * @param {module:api/SongsApi~apiSongsApiSongsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SongsResponse}
     */
    apiSongsApiSongsGet(callback) {
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
      let returnType = SongsResponse;
      return this.apiClient.callApi(
        '/api/songs', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }


}
