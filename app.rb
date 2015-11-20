require 'bundler'
Bundler.require

get '/' do
  erb :intro
end
