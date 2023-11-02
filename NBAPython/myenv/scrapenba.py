import numpy as np
import requests as req
import pandas as pd
from nba_api.stats.endpoints import playercareerstats as nba
from nba_api.stats.endpoints import scoreboard
from nba_api.stats.endpoints import boxscoretraditionalv2 as boxscores


# get box scores for the last game each team played prior to today
def get_box_scores():
    # get the scoreboard for yesterday's games
    sb = scoreboard.Scoreboard(day_offset=-1)
    sb = sb.get_data_frames()[0]

    # get the scoreboard for the last 5 days of games and filter for the last game each team played
    for i in range(2, 6):
        sb = pd.concat([sb, scoreboard.Scoreboard(day_offset=-i).get_data_frames()[0]])

    # filter for the last game each team played
    sb = sb.sort_values(by=['GAME_DATE_EST'])
    sb = sb.drop_duplicates(subset=['GAME_ID'], keep='last')

    return sb

# get the player stats for the last game each team played prior to today
# export as .json file
def get_player_stats_json():
    # get the box scores for yesterday's games
    box_scores = get_box_scores()

    # get the player stats for yesterday's games
    player_stats = []
    for game in box_scores['GAME_ID']:
        player_stats.append(boxscores.BoxScoreTraditionalV2(game).get_data_frames()[0])
        
    # combine player_stats into one dataframe
    player_stats = pd.concat(player_stats)

    # print the player stats as .json
    player_stats.to_json('player_stats.json', orient='records')

# get the player stats for the last game each team played prior to today
get_player_stats_json()