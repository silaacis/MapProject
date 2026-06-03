namespace MapApi.Dtos
{
    public class GeometryListDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string GeoJson { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }
    }
}
