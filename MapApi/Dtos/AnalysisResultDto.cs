namespace MapApi.Dtos
{
    public class AnalysisResultDto
    {
        //geometrik analiz sonucu frontend'e dönecek olan geometrileri temsil edecek olan sınıf
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string GeoJson { get; set; } = string.Empty;
    }
}
