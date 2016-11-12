;(function($) {
	/*
		admin-media-embedurl-wh-fields-hack.js

		Set of monkey patches for adding width and height fields in load from url media tab
	*/

	/*
		EmbedUrl
		this view control the UI of "Insert url from external site"
	*/
	var $view = wp.media.view.EmbedUrl;

	if($view) {
		/*
			redefine constructor
			here we define and append inputs to form
		*/
		var $oldInit = $view.prototype.initialize;

		$view.prototype.initialize = function() {
			$oldInit.call(this);

			this.$width = $('<input>', {
				id : 'embed-url-width',
				value : this.model.get('width'),
				placeholder : adminMediaHackTranslation.widthPlaceholder,
				type : 'text'
			});
			//' id="embed-url-width" type="text" />').val( this.model.get('width') );
			this.width_el = this.$width[0];

			this.$height = $('<input>', {
				id : 'embed-url-height',
				value : this.model.get('height'),
				placeholder : adminMediaHackTranslation.heightPlaceholder,
				type : 'text'
			});
			 //' id="embed-url-height" type="text" />').val( this.model.get('height') );
			this.height_el = this.$height[0];

			this.$el.append([this.$width, this.$height]);

			this.model.set('size', 'custom');
			this.model.trigger('change:size');
		}

		/*
			callback that called on events ["input", "keyup", "change"] of any input in UI
		*/
		var $oldUrl = $view.prototype.url;

		$view.prototype.url = function(e) {
			// default behavior - update `url` field in model
			if(e.target === this.input)
				$oldUrl.call(this, e);
			// update width
			if(e.target === this.width_el) {
				this.model.set('customWidth', event.target.value);
				this.model.set('width', event.target.value);
				this.model.trigger('change:size');
			}
			// update height
			if(e.target === this.height_el) {
				this.model.set('customHeight', event.target.value);
				this.model.set('height', event.target.value);
				this.model.trigger('change:size');
			}

			// honestly, i didnt found a way to redefine updating app state, so there we force update state
			wp.media.frame.state('embed').metadata = _.pick(this.model.toJSON(), 'url', 'width', 'height');
		}

		/*
			redefine `render` method
			here we set values on inputs
		*/
		var $render = $view.prototype.render;

		$view.prototype.render = function() {
			this.width_el.value = this.model.get('width') || '';
			this.height_el.value = this.model.get('height') || '';
			return $render.call(this);
		}
	}

	var $editor = wp.media.editor;

	if($editor && $editor.send && $editor.send.link) {
		var $link = $editor.send.link;
		
		/*
			redefine `send.link` helper function, that sends data to server for processing
			sends `width` and `height` as POST params
		*/
		wp.media.editor.send.link = function(embed) {
			return wp.media.post( 'send-link-to-editor', {
				nonce:     wp.media.view.settings.nonce.sendToEditor,
				src:       embed.linkUrl,
				link_text: embed.linkText,
				width:     embed.customWidth,
				height:    embed.customHeight,
				html:      wp.media.string.link( embed ),
				post_id:   wp.media.view.settings.post.id
			});
		}
	}

})(jQuery);