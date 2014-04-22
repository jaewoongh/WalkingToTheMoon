(function() {
	Math.map = function(val, min1, max1, min2, max2) {
		return (val - min1) * (max2 - min2) / (max1 - min1) + min2;
	};

	Math.map2 = function(val, min1, max1, min2, max2) {
		var newVal = (val - min1) * (max2 - min2) / (max1 - min1) + min2;
		Math.min(newVal, min2);
		Math.max(newVal, max2);
		return newVal;
	};
}())