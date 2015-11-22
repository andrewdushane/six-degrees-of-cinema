class Query

  def fetch_movie params
    @url = 'http://www.omdbapi.com/?'
    if params['searchType'] == 'list'
      @url += 's=' + params['s']
    elsif params['searchType'] == 'single'
      @url += 'i=' + params['i'] + '&tomatoes=true'
    else
      @url = false
    end
    if @url
      @results = HTTParty.get(@url)
    end
    return @results.to_json
  end

end
