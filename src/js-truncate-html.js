(function(truncator){
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        module.exports = truncator();
    } else if (typeof define === 'function' && define.amd){
        define([], function(){
            return truncator();
        });
    } else {
        var global;
        try {
          global = (false || eval)('this'); // best cross-browser way to determine global for < ES5
        } catch (e) {
          global = window; // fails only if browser (https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives)
        }
        global.JsTruncateHtml = truncator(); // assume jQuery is in global namespace
    }
})(function () {
    var truncator = function(options) {
    	var options = options || {};
		options.includeElipsis = options.includeElipsis;
		options.elipsisLength = options.elipsisLength || 3;
		options.elipsisCharacter = options.elipsisCharacter || '.';
        
        return {

			truncate: function(inputHtmlContent, expectedLength) {

				var stack = [];
				var output = '';
				var outputLength = 0;
				var exit = false;

				var htmlContent =  this.decodeHtml(inputHtmlContent);
				//expectedLength += htmlContent.

				while (expectedLength > outputLength && exit == false) {
			    	var openingTagStartIndex = htmlContent.indexOf('<');
			    	var openingTagEndIndex = htmlContent.indexOf('>');

			    	//If no further html tags are found slice and return remaining required string
			    	if (openingTagStartIndex < 0) {
			    		output += this.encodeHtml(htmlContent.slice(0, expectedLength - outputLength));
			    		break;
			    	} else if (openingTagStartIndex > 0) {
						//Extract text fragment before start tag
						var textFragment = htmlContent.slice(0, openingTagStartIndex);


						//Append text fragment to output
						var textFragmentLength = textFragment.length;
						var requiredContentLength = expectedLength - outputLength;
						var outputFragment = textFragment.slice(0, requiredContentLength);
						output = output + this.encodeHtml(outputFragment);
						outputLength += outputFragment.length;

						/*if (stack.length > 0) {
							output = output + '</' + stack.pop() + '>';
						}*/

						htmlContent = htmlContent.slice(openingTagStartIndex);
						continue;
			    	}

			    	//Check if htmlContent start wtih closing tag
			    	if (htmlContent.indexOf('</') == openingTagStartIndex) {
			    		output = output + '</' + stack.pop() + '>';
			    		htmlContent = htmlContent.slice(openingTagEndIndex + 1);
			    		continue;
			    	}

			    	//Break if expected length output found 
					if (expectedLength <= outputLength) {
						break;
					}

					//Get opening tag fragment
					var openingTagFragment = htmlContent.slice(openingTagStartIndex, openingTagEndIndex + 1)
					//Append opening tag fragment to output
					output += openingTagFragment;

					//Check if tag in closed like </br>
					if (openingTagFragment.indexOf('/') > -1) {
						

					} else {
						//Store tags to be closed at the end
						var tagName = openingTagFragment.slice(1, openingTagFragment.indexOf(' '));
						stack.push(tagName);
					}

					htmlContent = htmlContent.slice(openingTagEndIndex + 1);
				}

				while(stack.length > 0) {
					output = output + '</' + stack.pop() + '>';
				}

				if (options.includeElipsis) {
					output += Array(options.elipsisLength + 1).join(options.elipsisCharacter);
				}


				return output;
			},

			decodeHtml: function (encodedHtml) {
				var virualDOM = document.createElement("textarea");
				virualDOM.innerHTML = encodedHtml;
				return virualDOM.value;
			},

			encodeHtml: function (decodeHtml) {
				var virtualDOM = document.createElement("div");
				return virtualDOM.appendChild(document.createTextNode(decodeHtml)).parentNode.innerHTML;
			}
		}
        
    };
    
    return truncator;
});
