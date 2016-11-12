<?php
/*
	Plugin Name: Admin Media embed width/height hack
	Description: Adds fields to control width/height of embedded data
	Version: 0.1
	Author: ikenfin
	Author URI: http://ikfi.ru
*/

/*
	Default width and height for embedded data filter
*/
define('ADMIN_MEDIA_WH_HACK_DEFAULT_EMBED_WIDTH', 750);
define('ADMIN_MEDIA_WH_HACK_DEFAULT_EMBED_HEIGHT', 375);


////////////////////
//    FILTERS
////////////////////

/*
	Default embed width/height filter
*/
function admin_media_wh_hack_modify_embed_defaults($size, $url) {
    return array(
        'width'  => ADMIN_MEDIA_WH_HACK_DEFAULT_EMBED_WIDTH,
        'height' => ADMIN_MEDIA_WH_HACK_DEFAULT_EMBED_HEIGHT,
        'url' => $url
    );
}
add_filter( 'embed_defaults', 'admin_media_wh_hack_modify_embed_defaults', 1, 3);

/*
	Redefine processing of embed code
*/
function admin_media_wh_hack_media_send_to_editor($html, $src, $link_text) {
    if(substr($html, 0, 7) == '[embed]' && $src !== null) {
        $html = '[embed';
        if(isset($_POST['width']) && preg_match('/^\d+%?$/', $_POST['width'])) { //is_numeric($_POST['width'])) {
            $html .= ' width=' . $_POST['width'];
        }
        if(isset($_POST['height']) && preg_match('/^\d+%?$/', $_POST['height'])) { //is_numeric($_POST['height'])) {
            $html .= ' height=' . $_POST['height'];
        }
        $html .= ']' . $src . '[/embed]';
    }

    return $html;
}
add_filter( 'file_send_to_editor_url', 'admin_media_wh_hack_media_send_to_editor', 10, 2);

/*
	Redefine processing output to client
*/
function admin_media_wh_hack_oembed_html($data, $url, $args) {
    $data = preg_replace("/width=\"[^\"]+\"/", 'width="' . $args['width'] . '"', $data);
    $data = preg_replace("/height=\"[^\"]+\"/", 'height="' . $args['height'] . '"', $data);
    return $data;
}
add_filter('embed_oembed_html', 'admin_media_wh_hack_oembed_html', 10, 3);


////////////////////
//     ACTIONS
////////////////////

/*
	Including set of monkey patch.
*/
function admin_media_wh_hack_enqueue_scripts() {
    wp_register_script('admin-media-wh-hack-monkey-patches', plugins_url('/js/admin-media-embedurl-wh-fields-hack.js', __FILE__), array('media-views', 'media-editor'));
    wp_enqueue_script('admin-media-wh-hack-monkey-patches');
    wp_localize_script('admin-media-wh-hack-monkey-patches', 'adminMediaHackTranslation', array(
        'widthPlaceholder' => 'width',
        'heightPlaceholder' => 'height'
    ));
}

add_action( 'admin_enqueue_scripts', 'admin_media_wh_hack_enqueue_scripts');