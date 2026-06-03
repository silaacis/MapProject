namespace MapApi.Dtos
{
    public class UpdateGeometryDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string GeoJson { get; set; } = string.Empty;
    }
}
