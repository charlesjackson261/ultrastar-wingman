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

import ApiClient from '../ApiClient';
import Paging from './Paging';
import Song from './Song';

/**
 * The SongsResponse model module.
 * @module model/SongsResponse
 * @version 1.1.0
 */
class SongsResponse {
    /**
     * Constructs a new <code>SongsResponse</code>.
     * @alias module:model/SongsResponse
     * @param paging {module:model/Paging} 
     * @param songs {Array.<module:model/Song>} 
     */
    constructor(paging, songs) { 
        
        SongsResponse.initialize(this, paging, songs);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, paging, songs) { 
        obj['paging'] = paging;
        obj['songs'] = songs;
    }

    /**
     * Constructs a <code>SongsResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/SongsResponse} obj Optional instance to populate.
     * @return {module:model/SongsResponse} The populated <code>SongsResponse</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new SongsResponse();

            if (data.hasOwnProperty('paging')) {
                obj['paging'] = Paging.constructFromObject(data['paging']);
            }
            if (data.hasOwnProperty('songs')) {
                obj['songs'] = ApiClient.convertToType(data['songs'], [Song]);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>SongsResponse</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>SongsResponse</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of SongsResponse.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // validate the optional field `paging`
        if (data['paging']) { // data not null
          Paging.validateJSON(data['paging']);
        }
        if (data['songs']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['songs'])) {
                throw new Error("Expected the field `songs` to be an array in the JSON data but got " + data['songs']);
            }
            // validate the optional field `songs` (array)
            for (const item of data['songs']) {
                Song.validateJSON(item);
            };
        }

        return true;
    }


}

SongsResponse.RequiredProperties = ["paging", "songs"];

/**
 * @member {module:model/Paging} paging
 */
SongsResponse.prototype['paging'] = undefined;

/**
 * @member {Array.<module:model/Song>} songs
 */
SongsResponse.prototype['songs'] = undefined;






export default SongsResponse;

