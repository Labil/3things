function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

function rainbow(sat, light) {
  // 30 random hues with step of 12 degrees
  var hue = Math.floor(Math.random() * 30) * 12;

    return $.Color({
        hue: hue,
        saturation: sat,
        lightness: light,
        alpha: 1
    }).toHexString();
};

function get_random_color() {
    var letters = 'ABCDE'.split('');
    var color = '#';
    for (var i=0; i<3; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}