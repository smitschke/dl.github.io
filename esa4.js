$(document).ready(function(){
    
    //Linienanzeige
    var display_lines = true;
    renderFish(display_lines);
    renderShell(display_lines);
    renderWaterlily(display_lines);
    
    $('#line_checkbox').click(function() {
        
        if ($('#line_checkbox').prop('checked')) {
            display_lines = true;
        } else {
            display_lines = false;
        }
        renderFish(display_lines);
        renderShell(display_lines);
        renderWaterlily(display_lines);
    });

    //Shell-Controls
    $(function() {
        $( "#a_shell_slider" ).slider({
            value: 0.25,
            min: 0,
            max: 0.45,
            step: 0.01,
            slide: function( event, ui ) {
                $( "#a_shell" ).val( ui.value );
                renderShell(display_lines);
            }
        });
        $( "#a_shell" ).val( $( "#a_shell_slider" ).slider( "value" ) );
    });

    $(function() {
        $( "#b_shell_slider" ).slider({
            value: 1,
            min: 0,
            max: 1,
            step: 0.01,
            slide: function( event, ui ) {
                $( "#b_shell" ).val( ui.value );
                renderShell(display_lines);
            }
        });
        $( "#b_shell" ).val( $( "#b_shell_slider" ).slider( "value" ) );
    });

    $(function() {
        $( "#c_shell_slider" ).slider({
            value: 0.0,
            min: 0,
            max: 0.24,
            step: 0.01,
            slide: function( event, ui ) {
                $( "#c_shell" ).val( ui.value );
                renderShell(display_lines);
            }
        });
        $( "#c_shell" ).val( $( "#c_shell_slider" ).slider( "value" ) );
    });

    $(function() {
        $( "#w_shell_slider" ).slider({
            value: 3,
            min: 1,
            max: 3,
            step: 1,
            slide: function( event, ui ) {
                $( "#w_shell" ).val( ui.value );
                renderShell(display_lines);
            }
        });
        $( "#w_shell" ).val( $( "#w_shell_slider" ).slider( "value" ) );
    });
});
