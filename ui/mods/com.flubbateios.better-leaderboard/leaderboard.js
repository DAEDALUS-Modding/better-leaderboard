loadCSS('coui://ui/mods/com.flubbateios.better-leaderboard/style.css');
const oldLBU = LeaderboardUtility.RankedPlayerModel;
const newRPModel = function(lp,dn,e){
	this.ratingUnstableRaw = e.VolatileRating;
	this.ratingStableRaw = e.StableRating;
	this.roundedUnstableRating = (1/1000 * Math.round(1000* this.ratingUnstableRaw)).toFixed(3);
	this.roundedStableRating = (1/1000 * Math.round(1000* this.ratingStableRaw)).toFixed(3);
	this.rankStyle = ko.observable('');
	oldLBU.call(this,lp,dn,e);
};

LeaderboardUtility.RankedPlayerModel = newRPModel;
//yourself seems to be assigned before we can switch the model
model.yourself = new newRPModel(model.playerLeaguePosition,model.playerDisplayName,model.yourEntry);

//cant change script even if text-html :(
//some disgusting code
const PTPL = $($('#player-template').html());
PTPL.find('.rating').attr('data-bind','text:roundedStableRating');
PTPL.attr('data-bind','css: { row_player_yourself: uberId == model.yourself.uberId },attr:{class:\'row_player \' + rankStyle()}');
PTPL.find('.rating').after('<div class="rating unstable-rating" data-bind="text: roundedUnstableRating">?</div>')
$('#player-template').html(PTPL[0].outerHTML);

const LTPL = $($('#league-template').html());
LTPL.find('.rating').html('Stable');
LTPL.find('.rating').after('<div class="rating unstable-rating">Volatile</div>');

$('#league-template').html(LTPL[0].outerHTML);


model.playerSearchBox = ko.observable('');


const playerSearchResult = ko.computed(function(){
	const found = [];
	if(model.playerSearchBox().length < 2){
		return found;
	}
	const sr = model.playerSearchBox().toLowerCase().replace(/ /g,'');
	for (var i = 1; i<6; i++){
		if(!model.leagues[i]){
			continue;
		}
		model.leagues[i].players().forEach(function(pl){
			if(_.includes(pl.displayName().toLowerCase().replace(/ /g,''),sr)){
				pl.rankStyle ( ['','uber-r','platinum-r','gold-r','silver-r','bronze-r'][i]);
				found.push(pl);
			}
		});
	}
	return found;
});

model.searchResult = {
	showLeaderboard:true,
	showYourselfException:false,
	displaySize:ko.computed(function(){
		if (playerSearchResult().length === 1)
            return '!LOC:One ranked player found';
        else if (playerSearchResult().length === 0)
            return '!LOC:No ranked players found.';
        else
            return ['!LOC:__num_players__ ranked players found', { num_players: playerSearchResult().length }];
	}),
	players:playerSearchResult
};
$('.active.tab_level').after('<li class="tab_level">'+
                            '<a href="#search" data-toggle="pill" data-bind="click_sound: \'default\', rollover_sound: \'default\'">'+
							'<img src="coui://ui/main/shared/img/level_badges/badge_level_5_28px.png" style="visibility:hidden"/>'+
                                '<span style="font-weight:bold"><loc>Search</loc></span>'+
                           ' </a>'+
                        '</li>');
$('.tab-pane#uber').after('<div class="tab-pane" id="search">'+
'<input type="text" class="search-box" data-bind="value:playerSearchBox" />'+
'<div data-bind="template: { name: \'league-template\', data: searchResult }"></div>'+
'</div>');

