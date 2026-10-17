library(tidyverse)
library(readr)
library(jsonlite)

url = "https://raw.githubusercontent.com/open-numbers/ddf--gapminder--ai_worldview_benchmark/refs/heads/master/ddf--entities--question.csv"
df <- read_csv(url)
df %>%
filter(!is.na(published_version_of_question))->df_clear

json_string = toJSON(df_clear, pretty = TRUE)
writeLines(json_string, "database.json")