/* 
* 
* Copyright (c) 2012-2014 Adobe Systems Incorporated. All rights reserved.

* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"), 
* to deal in the Software without restriction, including without limitation 
* the rights to use, copy, modify, merge, publish, distribute, sublicense, 
* and/or sell copies of the Software, and to permit persons to whom the 
* Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
* DEALINGS IN THE SOFTWARE.
* 
*/

(function(app) {
	var SELECT_FIELDS = "Please select the fields you want to include.";
	var NO_SUBRESOURCES_FOUND = "No <b>{0}</b> contain <b>{1}</b> subresources. Please add one on your site.";
	var NO_EXISTING_RESOURCE_SELECTED = "No <b>{0}</b> resource selected. Please select one from your site.";

	/**
	 * @constructor
	 * @public
	 * @description
	 * This class provides the module data generator which is responsible to generate queries based on the currently
	 * selected fields.
	 */
	function ModuleDataController($scope, generatorsService, configService, moduleDataHighlighter) {
		var self = this;

		this._generatorsService = generatorsService;
		this._configService = configService;

		this.$scope = $scope;
		this.$scope.moduleDataHighlighter = moduleDataHighlighter;

		this.$scope.data = this._generatorsService.data;
		this.$scope.snippet = SELECT_FIELDS;

		this.$scope.generateSnippet = function(data) {
			return self._generateSnippet(data);
		};

		this.$scope.$watch(
			function() {
				return self._generatorsService.data;
			},
			function(data) {
				self.$scope.generateSnippet(data);
			});

		console.log("Module data controller instantiated.");
	};

	/**
	 * @private
	 * @method
	 * @instance
	 * @description
	 * This method generates a snippet of code based on the newly selected data.
	 */
	ModuleDataController.prototype._generateSnippet = function(data) {
		if(!this._validateInputData(data, this.$scope)) {
			return;
		}

		var snippet = ['{module_data resource="'],
			fieldsParam = [],
			limits = this._configService.limits;

		for(var idx = 0; idx < data.fields.length; idx++) {
			fieldsParam.push(data.fields[idx].name);
		}

		snippet.push(data.resourceName);
		snippet.push('" ');

		snippet.push('version="');
		snippet.push(data.version);
		snippet.push('" ');

		snippet.push('fields="');
		snippet.push(fieldsParam.join(","));
		snippet.push('"');

		if(data.subresourceName) {
			snippet.push(' subresource="');
			snippet.push(data.subresourceName)
			snippet.push('"');
		}

		if(this.$scope.sampleResourcesSelection.value) {
			snippet.push(' resourceId="');
			snippet.push(this.$scope.sampleResourcesSelection.value);
			snippet.push('"');
		}

		snippet.push(' skip="');
		snippet.push(limits.skip);
		snippet.push('"');

		snippet.push(' limit="');
		snippet.push(limits.limit);
		snippet.push('"');

		snippet.push("}");

		this.$scope.snippet = snippet.join("");
	};

	/**
	 * @private
	 * @instance
	 * @method
	 * @description
	 * This method validates the given input data and updates the code snippet if an error occurs.
	 */
	ModuleDataController.prototype._validateInputData = function(data, scope) {
		this.$scope.snippet = undefined;

		if(!data.fields || data.fields.length == 0) {
			this.$scope.snippet = SELECT_FIELDS;

			return false;
		}

		if(data.subresourceName && (!data.sampleResources || data.sampleResources.length == 0)) {
			this.$scope.snippet = NO_SUBRESOURCES_FOUND.replace("{0}", data.resourceName)
									.replace("{1}", data.subresourceName);

			return false;
		}

		if(data.subresourceName && !data.existingResourceId) {
			this.$scope.snippet = NO_EXISTING_RESOURCE_SELECTED.replace("{0}", data.resourceName);

			return false;
		}

		return true;
	};

	app.controller("ModuleDataController", ["$scope", "GeneratorsDataService", "ConfigService", 
											"ModuleDataHighlighterService", ModuleDataController]);
})(DiscoveryApp);