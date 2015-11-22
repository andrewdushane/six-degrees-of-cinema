require 'bundler'
Bundler.require

get '/' do
  erb :intro
end

get '/movie' do
  movie = Query.new
  return movie.fetch_movie params
end
