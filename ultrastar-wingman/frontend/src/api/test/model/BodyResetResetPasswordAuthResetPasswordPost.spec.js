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

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', process.cwd()+'/src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require(process.cwd()+'/src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.UltraStarWingman);
  }
}(this, function(expect, UltraStarWingman) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new UltraStarWingman.BodyResetResetPasswordAuthResetPasswordPost();
  });

  var getProperty = function(object, getter, property) {
    // Use getter method if present; otherwise, get the property directly.
    if (typeof object[getter] === 'function')
      return object[getter]();
    else
      return object[property];
  }

  var setProperty = function(object, setter, property, value) {
    // Use setter method if present; otherwise, set the property directly.
    if (typeof object[setter] === 'function')
      object[setter](value);
    else
      object[property] = value;
  }

  describe('BodyResetResetPasswordAuthResetPasswordPost', function() {
    it('should create an instance of BodyResetResetPasswordAuthResetPasswordPost', function() {
      // uncomment below and update the code to test BodyResetResetPasswordAuthResetPasswordPost
      //var instance = new UltraStarWingman.BodyResetResetPasswordAuthResetPasswordPost();
      //expect(instance).to.be.a(UltraStarWingman.BodyResetResetPasswordAuthResetPasswordPost);
    });

    it('should have the property token (base name: "token")', function() {
      // uncomment below and update the code to test the property token
      //var instance = new UltraStarWingman.BodyResetResetPasswordAuthResetPasswordPost();
      //expect(instance).to.be();
    });

    it('should have the property password (base name: "password")', function() {
      // uncomment below and update the code to test the property password
      //var instance = new UltraStarWingman.BodyResetResetPasswordAuthResetPasswordPost();
      //expect(instance).to.be();
    });

  });

}));
