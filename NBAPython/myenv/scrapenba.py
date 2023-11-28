import numpy as np
import requests as req
import pandas as pd
from nba_api.stats.endpoints import playercareerstats as nba
from nba_api.stats.endpoints import scoreboard
from nba_api.stats.endpoints import boxscoretraditionalv2 as boxscores
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# to activate venv in terminal: myenv/Scripts/Activate.ps1
# if scripts not allowed in terminal: Set-ExecutionPolicy Unrestricted -Scope Process

# get box scores for the last game each team played prior to today
def get_box_scores():
    # get the scoreboard for yesterday's games
    s = scoreboard.Scoreboard(day_offset=-1)
    s = s.get_data_frames()[0]

    # get the scoreboard for the last 15 days of games
    for i in range(2, 5):
        s = pd.concat([s, scoreboard.Scoreboard(day_offset=-i).get_data_frames()[0]])

    # filter for games that were played
    player_stats = []
    for game in s['GAME_ID']:
        p = boxscores.BoxScoreTraditionalV2(game).get_data_frames()[0]
        # get opposing team id
        opp = p['TEAM_ID'].shift(-1)
        p['OPP_TEAM_ID'] = opp
        player_stats.append(p[p['MIN'].notnull()])
        
    # combine player_stats into one dataframe
    sb = pd.concat(player_stats)


    # calculate fantasy points for each record
    sb['FPTS'] = sb['PTS'] + sb['REB']*1.2 + sb['AST']*1.5 + sb['STL']*3 + sb['BLK']*3 - sb['TO'] + sb['FG3M']*0.5

    # calculate team fantasy points per game
    t1 = sb.groupby('GAME_ID').sum(numeric_only=True)
    t1.groupby('TEAM_ID').mean(numeric_only=True).reset_index()
    t1 = t1[['TEAM_ID', 'FPTS']]
    t1.columns = ['TEAM_ID', 'FPTS_AVG']

    # # calculate team fantasy points allowed per game
    # t2 = sb.groupby('GAME_ID').sum(numeric_only=True)
    # t2.groupby('OPP_TEAM_ID').mean(numeric_only=True).reset_index()
    # t2 = t2[['OPP_TEAM_ID', 'FPTS']]
    # t2.columns = ['OPP_TEAM_ID', 'FPTS_ALLOWED_AVG']

    # merge sb with team fantasy points per game and opp_team fantasy points allowed per game
    sb = pd.merge(sb, t1, on='TEAM_ID')
    # sb = pd.merge(sb, t2, on='OPP_TEAM_ID')

    # calculate player fantasy points per game as a percent of team fantasy points per game and opp_team fantasy points allowed per game
    sb['FPTS_PCT_OF_TEAM'] = (sb['FPTS'] / sb['FPTS_AVG'] )# + sb['FPTS'] / sb['FPTS_ALLOWED_AVG'])/2

    # calculate mean of 'FPTS_PCT_OF_TEAM' for each player
    playerfpot = sb.groupby('PLAYER_ID').mean(numeric_only=True).reset_index()
    playerfpot = playerfpot[['PLAYER_ID', 'FPTS_PCT_OF_TEAM']]

    # merge playerfpot with sb
    sb = pd.merge(sb, playerfpot, on='PLAYER_ID')


    # print the player stats as .json
    sb.to_json('player_stats.json', orient='records')

    # create a prediciton model for FPTS based on FPTS_PCT_OF_TEAM, FPTS_AVG, and FPTS_ALLOWED_AVG
    # create X and y
    X = sb[['FPTS_PCT_OF_TEAM', 'FPTS_AVG']]#, 'FPTS_ALLOWED_AVG']]
    y = sb['FPTS']

    # split X and y into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

    # create a LinearRegression model and fit it to the training data
    model = LinearRegression()
    model.fit(X_train, y_train)

    # calculate the r2 score for the training and testing data
    training_score = model.score(X_train, y_train)
    testing_score = model.score(X_test, y_test)

    # print the r2 score for the training and testing data
    print(f"Training Score: {training_score}")
    print(f"Testing Score: {testing_score}")

    # create a dataframe of the model coefficients
    coef = pd.DataFrame(model.coef_, X.columns, columns=['Coefficient'])
    coef = coef.reset_index()
    coef.columns = ['Feature', 'Coefficient']
    coef = coef.sort_values(by=['Coefficient'], ascending=False)

    # print the model coefficients
    print(coef)

get_box_scores()

# get the player stats for the last game each team played prior to today
# export as .json file
# def get_player_stats_json():
#     # get the box scores for yesterday's games
#     box_scores = get_box_scores()

#     # get the player stats for yesterday's games
#     player_stats = []
#     for game in box_scores['GAME_ID']:
#         player_stats.append(boxscores.BoxScoreTraditionalV2(game).get_data_frames()[0])
        
#     # combine player_stats into one dataframe
#     player_stats = pd.concat(player_stats)

#     # print the player stats as .json
#     player_stats.to_json('player_stats.json', orient='records')

# # get the player stats for the last game each team played prior to today
# get_player_stats_json()