module.exports = {
  name: 'Tigerfights IPTV', // unique addon name
  prefix: 'Tigerfights IPTV', // unique addon prefix (must be different for all addons!)
  icon: 'https://tigerfights.surge.sh/logo.png', // set the correct domain name here so the logo is accessible
  description: 'Mixed IPTV', // addon description
  connLimit: false, // can be false or an integer, if set to an integer, it will show a message with "Limited to X connections."
  paginate: 100, // how many catalogs to show per page
  playlistUrl: 'http://web24.live:25461/get.php?username=bxguyhere&password=loveisforever&type=m3u_plus', // the URL to the M3U playlist
}