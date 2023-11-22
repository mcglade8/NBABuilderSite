import numpy as np
import requests as req
import pandas as pd
from nba_api.stats.endpoints import playercareerstats as nba
from nba_api.stats.endpoints import scoreboard
from nba_api.stats.endpoints import boxscoretraditionalv2 as boxscores
from nba_api.stats.static import players
from nba_api.stats.static import teams
from nba_api.stats.endpoints import CumeStatsPlayer as csp
from bs4 import BeautifulSoup as bs

# get season stats for all players from https://www.basketball-reference.com/leagues/NBA_2024_totals.html
def get_season_stats():
    url = 'https://www.basketball-reference.com/leagues/NBA_2024_totals.html'
    html = req.get(url)
    soup = bs(html.content, 'html.parser')
    table = soup.find('table', {'id': 'totals_stats'})
    df = pd.read_html(str(table))[0]
    df = df.drop(columns=['Rk'])
    # replace na with 0
    df = df.fillna(0)
    df = df.reset_index(drop=True)
    # write df to json
    df.to_json('season_stats.json', orient='records')

get_season_stats()


# get all game_ids for the current season
def get_game_ids():
    # get the scoreboard for today's games
    sb = scoreboard.Scoreboard()
    sb = sb.get_data_frames()[0]

    # get the scoreboard for the last 5 days of games
    for i in range(1, 6):
        sb = pd.concat([sb, scoreboard.Scoreboard(day_offset=-i).get_data_frames()[0]])

    # filter for the last game each team played
    sb = sb.sort_values(by=['GAME_DATE_EST'])
    sb = sb.drop_duplicates(subset=['GAME_ID'], keep='last')

    return sb['GAME_ID'].to_list()


# get box scores for the last game each team played prior to today
def get_box_scores(days_back = 5):
    # get the scoreboard for yesterday's games
    sb = scoreboard.Scoreboard(day_offset=-1)
    sb = sb.get_data_frames()[0]

    # get the scoreboard for the last 5 days of games and filter for the last game each team played
    for i in range(2, days_back):
        sb = pd.concat([sb, scoreboard.Scoreboard(day_offset=-i).get_data_frames()[0]])

    # filter for the last game each team played
    sb = sb.sort_values(by=['GAME_DATE_EST'])
    sb = sb.drop_duplicates(subset=['GAME_ID'], keep='last')

    return sb

# get the player stats for the last game each team played prior to today
# export as .json file
def get_player_stats_json():
    # get the box scores for yesterday's games
    box_scores = get_box_scores(5)

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



# get the player stats for the last 10 days
# export as .json file
def get_last_20_stats():
    # get the box scores for yesterday's games
    box_scores = get_box_scores(20)

    # get the player stats for yesterday's games
    player_stats = []
    for game in box_scores['GAME_ID']:
        player_stats.append(boxscores.BoxScoreTraditionalV2(game).get_data_frames()[0])
        
    # combine player_stats into one dataframe
    player_stats = pd.concat(player_stats)

    # print the player stats as .json
    player_stats.to_json('last_20_stats.json', orient='records')

# get the player stats for the last 10 days
get_last_20_stats()

# get median of last 20 days for fantasy points and minutes played for each player
def get_median():
    # get the last 10 days of player stats
    df = pd.read_json('last_20_stats.json')

    # convert MIN to float with first two digits only
    df['MIN'] = df['MIN'].str.slice(0, 4).astype(float)

    # filter for only players who played at least 5 minutes
    df = df[df['MIN'] >= 5]

    # calculate fantasy points
    df['FPTS'] = df['PTS'] + df['REB'] * 1.2 + df['AST'] * 1.5 + df['BLK'] * 3 + df['STL'] * 3 - df['TO']

    # calculate the exponential moving average of fantasy points and minutes played
    # df['FPTS_EMA'] = df.groupby('PLAYER_ID')['FPTS'].transform(lambda x: x.ewm(span=20).mean())
    # df['MIN_EMA'] = df.groupby('PLAYER_ID')['MIN'].transform(lambda x: x.ewm(span=20).mean())

    # get medians for fantasy points and minutes played over the period
    df['FPTS_MEDIAN'] = df.groupby('PLAYER_ID')['FPTS'].transform('sum')/df.groupby('PLAYER_ID')['MIN'].transform('sum')
    df['MIN_MEDIAN'] = df.groupby('PLAYER_ID')['MIN'].transform(lambda x: x.ewm(span=20).mean())

    # drop columns
    df = df.drop(columns=['GAME_ID', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_CITY', 'PLAYER_ID', 'START_POSITION', 'COMMENT', 'MIN', 'PTS', 'REB', 'AST', 'BLK', 'STL', 'TO'])

    # drop duplicates
    df = df.drop_duplicates(subset=['PLAYER_NAME'], keep='last')

    # convert to key/value objects with PLAYER_NAME as the key
    df = df.set_index('PLAYER_NAME').to_json('medians.json', orient='index')

get_median()