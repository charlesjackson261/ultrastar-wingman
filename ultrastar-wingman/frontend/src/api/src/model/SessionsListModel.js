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
import SessionModel from './SessionModel';

/**
 * The SessionsListModel model module.
 * @module model/SessionsListModel
 * @version 1.1.0
 */
class SessionsListModel {
    /**
     * Constructs a new <code>SessionsListModel</code>.
     * @alias module:model/SessionsListModel
     */
    constructor() { 
        
        SessionsListModel.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>SessionsListModel</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/SessionsListModel} obj Optional instance to populate.
     * @return {module:model/SessionsListModel} The populated <code>SessionsListModel</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new SessionsListModel();

            if (data.hasOwnProperty('sessions')) {
                obj['sessions'] = ApiClient.convertToType(data['sessions'], [SessionModel]);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>SessionsListModel</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>SessionsListModel</code>.
     */
    static validateJSON(data) {
        if (data['sessions']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['sessions'])) {
                throw new Error("Expected the field `sessions` to be an array in the JSON data but got " + data['sessions']);
            }
            // validate the optional field `sessions` (array)
            for (const item of data['sessions']) {
                SessionModel.validateJSON(item);
            };
        }

        return true;
    }


}



/**
 * List of sessions.
 * @member {Array.<module:model/SessionModel>} sessions
 */
SessionsListModel.prototype['sessions'] = undefined;






export default SessionsListModel;

