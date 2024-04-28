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


import ApiClient from './ApiClient';
import BasicResponse from './model/BasicResponse';
import HTTPValidationError from './model/HTTPValidationError';
import OrderEnum from './model/OrderEnum';
import Paging from './model/Paging';
import PlayerConfig from './model/PlayerConfig';
import PlayerCreation from './model/PlayerCreation';
import PlayerList from './model/PlayerList';
import Score from './model/Score';
import ScoresModel from './model/ScoresModel';
import SessionModel from './model/SessionModel';
import SessionsListModel from './model/SessionsListModel';
import Song from './model/Song';
import SongsResponse from './model/SongsResponse';
import USDBSong from './model/USDBSong';
import USDBSongsResponse from './model/USDBSongsResponse';
import UdEnum from './model/UdEnum';
import UsdbId from './model/UsdbId';
import UsdbIdsList from './model/UsdbIdsList';
import ValidationError from './model/ValidationError';
import PlayersApi from './api/PlayersApi';
import ScoresApi from './api/ScoresApi';
import SongsApi from './api/SongsApi';
import USDBApi from './api/USDBApi';
import UltraStarDeluxeApi from './api/UltraStarDeluxeApi';
import WebsiteApi from './api/WebsiteApi';


/**
* JS API client generated by OpenAPI Generator.<br>
* The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
* <p>
* An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
* <pre>
* var UltraStarWingman = require('index'); // See note below*.
* var xxxSvc = new UltraStarWingman.XxxApi(); // Allocate the API class we're going to use.
* var yyyModel = new UltraStarWingman.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
* and put the application logic within the callback function.</em>
* </p>
* <p>
* A non-AMD browser application (discouraged) might do something like this:
* <pre>
* var xxxSvc = new UltraStarWingman.XxxApi(); // Allocate the API class we're going to use.
* var yyy = new UltraStarWingman.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* </p>
* @module index
* @version 1.1.0
*/
export {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient,

    /**
     * The BasicResponse model constructor.
     * @property {module:model/BasicResponse}
     */
    BasicResponse,

    /**
     * The HTTPValidationError model constructor.
     * @property {module:model/HTTPValidationError}
     */
    HTTPValidationError,

    /**
     * The OrderEnum model constructor.
     * @property {module:model/OrderEnum}
     */
    OrderEnum,

    /**
     * The Paging model constructor.
     * @property {module:model/Paging}
     */
    Paging,

    /**
     * The PlayerConfig model constructor.
     * @property {module:model/PlayerConfig}
     */
    PlayerConfig,

    /**
     * The PlayerCreation model constructor.
     * @property {module:model/PlayerCreation}
     */
    PlayerCreation,

    /**
     * The PlayerList model constructor.
     * @property {module:model/PlayerList}
     */
    PlayerList,

    /**
     * The Score model constructor.
     * @property {module:model/Score}
     */
    Score,

    /**
     * The ScoresModel model constructor.
     * @property {module:model/ScoresModel}
     */
    ScoresModel,

    /**
     * The SessionModel model constructor.
     * @property {module:model/SessionModel}
     */
    SessionModel,

    /**
     * The SessionsListModel model constructor.
     * @property {module:model/SessionsListModel}
     */
    SessionsListModel,

    /**
     * The Song model constructor.
     * @property {module:model/Song}
     */
    Song,

    /**
     * The SongsResponse model constructor.
     * @property {module:model/SongsResponse}
     */
    SongsResponse,

    /**
     * The USDBSong model constructor.
     * @property {module:model/USDBSong}
     */
    USDBSong,

    /**
     * The USDBSongsResponse model constructor.
     * @property {module:model/USDBSongsResponse}
     */
    USDBSongsResponse,

    /**
     * The UdEnum model constructor.
     * @property {module:model/UdEnum}
     */
    UdEnum,

    /**
     * The UsdbId model constructor.
     * @property {module:model/UsdbId}
     */
    UsdbId,

    /**
     * The UsdbIdsList model constructor.
     * @property {module:model/UsdbIdsList}
     */
    UsdbIdsList,

    /**
     * The ValidationError model constructor.
     * @property {module:model/ValidationError}
     */
    ValidationError,

    /**
    * The PlayersApi service constructor.
    * @property {module:api/PlayersApi}
    */
    PlayersApi,

    /**
    * The ScoresApi service constructor.
    * @property {module:api/ScoresApi}
    */
    ScoresApi,

    /**
    * The SongsApi service constructor.
    * @property {module:api/SongsApi}
    */
    SongsApi,

    /**
    * The USDBApi service constructor.
    * @property {module:api/USDBApi}
    */
    USDBApi,

    /**
    * The UltraStarDeluxeApi service constructor.
    * @property {module:api/UltraStarDeluxeApi}
    */
    UltraStarDeluxeApi,

    /**
    * The WebsiteApi service constructor.
    * @property {module:api/WebsiteApi}
    */
    WebsiteApi
};
