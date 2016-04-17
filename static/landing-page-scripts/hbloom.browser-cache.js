
// Detect whether or not we are loading this page from the browser cache
// Set the value $.loadedFromBrowserCache, which other scripts can use

var CACHE_COOKIE = 'loadedFromBrowserCache';
jQuery.loadedFromBrowserCache = $.cookie(CACHE_COOKIE) == 'true';
$.cookie(CACHE_COOKIE, 'true', { path: '/' });
